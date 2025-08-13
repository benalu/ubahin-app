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
  const reqIdRef = useRef(0); // cegah stale response menimpa hasil baru

  // Untuk debugging/insight (opsional)
  const perfDeps = useMemo(
    () => ({ sourceLang, targetLang, maxChars }),
    [sourceLang, targetLang, maxChars]
  );

  const doTranslate = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        setOutputText("");
        setErrorMsg(null);
        return;
      }

      const myId = ++reqIdRef.current;
      const trimmedText = text.slice(0, maxChars);
      const startTime = Date.now();

      // Cek cache
      const cachedResult = translationCache.getCachedTranslation(
        trimmedText,
        sourceLang,
        targetLang
      );
      if (cachedResult) {
        setOutputText(cachedResult);
        setErrorMsg(null);
        setMetrics((prev) => ({
          ...prev,
          cacheHits: prev.cacheHits + 1,
          requestCount: prev.requestCount + 1,
        }));
        return;
      }

      // Abort request lama dengan reason (biar tidak "without reason")
      controllerRef.current?.abort(new DOMException("new-input", "AbortError"));
      const ctrl = new AbortController();
      controllerRef.current = ctrl;

      setLoading(true);
      setErrorMsg(null);

      try {
        const deduplicationKey = `${trimmedText}:${sourceLang}:${targetLang}`;

        // Dedup; factory mengembalikan string | null (null = aborted)
        const translation = await translationDeduplicator.deduplicate(
          deduplicationKey,
          async () => {
            if (ctrl.signal.aborted) return null; // sudah batal sebelum mulai

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
              // swallow abort—anggap dibatalkan normal
              if (isAbortError(e)) return null;
              throw e;
            }

            if (!res.ok) {
              if (res.status === 429) {
                throw new Error(
                  "Rate limit exceeded. Please wait before trying again."
                );
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

        // Jika null → request dibatalkan; diam saja
        if (translation == null) return;

        if (!translation) {
          throw new Error("Empty translation received");
        }

        // Cache hasil
        translationCache.setCachedTranslation(
          trimmedText,
          sourceLang,
          targetLang,
          translation
        );

        // Jangan timpa bila sudah ada request yang lebih baru
        if (myId !== reqIdRef.current) return;

        setOutputText(translation);

        const latency = Date.now() - startTime;
        setMetrics((prev) => ({
          requestCount: prev.requestCount + 1,
          cacheHits: prev.cacheHits,
          totalLatency: prev.totalLatency + latency,
          avgLatency: Math.round(
            (prev.totalLatency + latency) / (prev.requestCount + 1)
          ),
          errors: prev.errors,
        }));
      } catch (err: unknown) {
        if (isAbortError(err)) return; // diamkan abort normal

        // Error asli
        // eslint-disable-next-line no-console
        console.error("Translation error:", err);
        const em = getErrorMessage(
          err instanceof Error ? err : String(err),
          { operation: "convert" }
        );
        setErrorMsg(em.message);
        toastError(em);
        setOutputText("");

        setMetrics((prev) => ({
          ...prev,
          requestCount: prev.requestCount + 1,
          errors: prev.errors + 1,
        }));
      } finally {
        // Hanya matikan loading untuk request yang masih aktif
        if (myId === reqIdRef.current) setLoading(false);
      }
    },
    [sourceLang, targetLang, maxChars]
  );

  const handleTextInput = useCallback(
    (value: string) => {
      setInputText(value);
      if (timerRef.current) clearTimeout(timerRef.current);

      const delay = value.length < 100 ? 250 : value.length < 500 ? 350 : 500;

      timerRef.current = setTimeout(() => {
        void doTranslate(value);
      }, delay);
    },
    [doTranslate]
  );

  // Auto-translate saat bahasa berubah
  useEffect(() => {
    if (inputText.trim()) {
      void doTranslate(inputText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceLang, targetLang]);

  // Cleanup
  useEffect(() => {
    return () => {
      controllerRef.current?.abort(
        new DOMException("unmount", "AbortError")
      );
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const clearAll = useCallback(() => {
    controllerRef.current?.abort(new DOMException("clear", "AbortError"));
    if (timerRef.current) clearTimeout(timerRef.current);
    setInputText("");
    setOutputText("");
    setErrorMsg(null);
  }, []);

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
      deps: perfDeps, // membantu debug (apa yang di-observe)
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
