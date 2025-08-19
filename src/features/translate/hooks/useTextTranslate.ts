// src/features/translate/hooks/useTextTranslate.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toastError } from "@/lib/errors/notify";
import { getErrorMessage } from "@/lib/errors/errorMessages";
import { translationCache } from "@/lib/cache/translationCache";
import { translationDeduplicator } from "@/lib/performance/requestDeduplication";

type LangCode = string;

interface TranslationMetrics {
  requestCount: number;
  cacheHits: number;
  totalLatency: number;
  avgLatency: number;
  errors: number;
}

/** Type guard AbortError tanpa any */
function isAbortError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === "AbortError") return true;
  if (typeof err === "object" && err !== null) {
    const obj = err as Record<string, unknown>;
    const name = typeof obj.name === "string" ? obj.name : undefined;
    const code = typeof obj.code === "string" ? obj.code : undefined;
    const msg =
      typeof obj.message === "string" ? obj.message.toLowerCase() : "";
    return (
      name === "AbortError" ||
      code === "ABORT_ERR" ||
      msg.includes("aborted") ||
      msg.includes("signal is aborted")
    );
  }
  return false;
}

export function useTextTranslate(params: {
  sourceLang: LangCode;
  targetLang: LangCode;
  maxChars?: number;
}) {
  const { sourceLang, targetLang, maxChars = 5000 } = params;

  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<TranslationMetrics>({
    requestCount: 0,
    cacheHits: 0,
    totalLatency: 0,
    avgLatency: 0,
    errors: 0,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const reqIdRef = useRef(0);                 // cegah stale response menimpa hasil baru
  const prevTypedRef = useRef("");            // track input per keystroke

  // State hasil terakhir yang SUDAH diterjemahkan
  const lastTranslationRef = useRef<{
    input: string;
    output: string;
    sourceLang: string;
    targetLang: string;
  }>({
    input: "",
    output: "",
    sourceLang: "",
    targetLang: "",
  });

  const perfDeps = useMemo(
    () => ({ sourceLang, targetLang, maxChars }),
    [sourceLang, targetLang, maxChars]
  );

  const doTranslate = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        setOutputText("");
        setErrorMsg(null);
        lastTranslationRef.current = {
          input: "",
          output: "",
          sourceLang,
          targetLang,
        };
        return;
      }

      const myId = ++reqIdRef.current;
      const trimmedText = text.slice(0, maxChars);
      const startTime = Date.now();

      // Cache hit?
      const cachedResult = translationCache.getCachedTranslation(
        trimmedText,
        sourceLang,
        targetLang
      );
      if (cachedResult) {
        setOutputText(cachedResult);
        setErrorMsg(null);
        lastTranslationRef.current = {
          input: trimmedText,
          output: cachedResult,
          sourceLang,
          targetLang,
        };
        setMetrics((p) => ({
          ...p,
          cacheHits: p.cacheHits + 1,
          requestCount: p.requestCount + 1,
        }));
        return;
      }

      // Abort request lama
      controllerRef.current?.abort(new DOMException("new-input", "AbortError"));
      const ctrl = new AbortController();
      controllerRef.current = ctrl;

      setLoading(true);
      setErrorMsg(null);

      try {
        const dedupKey = `${trimmedText}:${sourceLang}:${targetLang}`;
        const translation = await translationDeduplicator.deduplicate(
          dedupKey,
          async () => {
            if (ctrl.signal.aborted) return null;

            let res: Response;
            try {
              res = await fetch("/api/translate/deepl", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: ctrl.signal,
                body: JSON.stringify({
                  text: trimmedText,
                  targetLang,
                  sourceLang: sourceLang === "auto" ? undefined : sourceLang,
                }),
              });
            } catch (e) {
              if (isAbortError(e)) return null;
              throw e;
            }

            if (!res.ok) {
              if (res.status === 429) {
                throw new Error("Rate limit exceeded. Please wait before trying again.");
              }
              throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }

            const contentType = res.headers.get("content-type") || "";
            const isJson = contentType.toLowerCase().includes("application/json");
            const data = isJson ? await res.json() : await res.text();
            const result =
              typeof data === "string" ? data : data?.translations?.[0]?.text ?? "";

            return result;
          }
        );

        if (translation == null) return; // dibatalkan

        if (!translation) {
          throw new Error("Empty translation received");
        }

        translationCache.setCachedTranslation(
          trimmedText,
          sourceLang,
          targetLang,
          translation
        );

        if (myId !== reqIdRef.current) return; // stale

        setOutputText(translation);
        lastTranslationRef.current = {
          input: trimmedText,
          output: translation,
          sourceLang,
          targetLang,
        };

        const latency = Date.now() - startTime;
        setMetrics((p) => ({
          requestCount: p.requestCount + 1,
          cacheHits: p.cacheHits,
          totalLatency: p.totalLatency + latency,
          avgLatency: Math.round((p.totalLatency + latency) / (p.requestCount + 1)),
          errors: p.errors,
        }));
      } catch (err) {
        if (isAbortError(err)) return;
        // eslint-disable-next-line no-console
        console.error("Translation error:", err);
        const em = getErrorMessage(err instanceof Error ? err : String(err), {
          operation: "convert",
        });
        setErrorMsg(em.message);
        setOutputText("");
        setMetrics((p) => ({
          ...p,
          requestCount: p.requestCount + 1,
          errors: p.errors + 1,
        }));
      } finally {
        if (myId === reqIdRef.current) setLoading(false);
      }
    },
    [sourceLang, targetLang, maxChars]
  );

  /** Clear rule yang agresif + optimistic trim */
  const handleTextInput = useCallback(
    (value: string) => {
      setInputText(value);
      if (timerRef.current) clearTimeout(timerRef.current);

      const was = prevTypedRef.current;
      const isDeleting = value.length < was.length;
      prevTypedRef.current = value;

      // ====== Dinamika saat user menghapus ======
      if (isDeleting && outputText) {
        const last = lastTranslationRef.current;
        const baseLen = last.input.length || 1;
        const ratio = Math.max(0, Math.min(1, value.length / baseLen));

        // 1) Optimistic trim: pangkas output sementara proporsional
        const approx = Math.floor((last.output || outputText).length * ratio);
        setOutputText((prev) => (prev ? prev.slice(0, approx) : ""));

        // 2) Bersihkan error & set loading false (kita akan trigger translate baru)
        setErrorMsg(null);
        setLoading(false);
      }

      // ====== Kalau input kosong → reset cepat ======
      if (!value.trim()) {
        controllerRef.current?.abort(new DOMException("empty", "AbortError"));
        setOutputText("");
        setErrorMsg(null);
        setLoading(false);
        lastTranslationRef.current = {
          input: "",
          output: "",
          sourceLang,
          targetLang,
        };
        return;
      }

      // ====== Debounce adaptif ======
      const delay =
        isDeleting ? 150 : value.length < 100 ? 250 : value.length < 500 ? 350 : 500;

      timerRef.current = setTimeout(() => {
        void doTranslate(value);
      }, delay);
    },
    [doTranslate, outputText, sourceLang, targetLang]
  );

  // Re-translate saat bahasa berubah + clear cepat
  useEffect(() => {
    const last = lastTranslationRef.current;
    if (sourceLang !== last.sourceLang || targetLang !== last.targetLang) {
      if (outputText) {
        setOutputText("");
        setErrorMsg(null);
      }
    }
    if (inputText.trim()) {
      void doTranslate(inputText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceLang, targetLang]);

  // Cleanup
  useEffect(() => {
    return () => {
      controllerRef.current?.abort(new DOMException("unmount", "AbortError"));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const clearAll = useCallback(() => {
    controllerRef.current?.abort(new DOMException("clear", "AbortError"));
    if (timerRef.current) clearTimeout(timerRef.current);
    setInputText("");
    setOutputText("");
    setErrorMsg(null);
    prevTypedRef.current = "";
    lastTranslationRef.current = {
      input: "",
      output: "",
      sourceLang,
      targetLang,
    };
  }, [sourceLang, targetLang]);

  const performanceInfo = useMemo(() => {
    const cacheStats = translationCache.getStats();
    const deduplicationStats = translationDeduplicator.getStats();
    return {
      ...metrics,
      cacheHitRate:
        metrics.requestCount > 0 ? metrics.cacheHits / metrics.requestCount : 0,
      errorRate:
        metrics.requestCount > 0 ? metrics.errors / metrics.requestCount : 0,
      cacheStats,
      deduplicationStats,
      deps: perfDeps,
    };
  }, [metrics, perfDeps]);

  return {
    inputText,
    outputText,
    errorMsg,
    loading,
    handleTextInput,
    clearAll,
    doTranslate,
    performanceInfo,
  };
}
