// src/features/translate/hooks/useTextTranslate.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toastError } from "@/lib/errors/notify";
import { getErrorMessage } from "@/lib/errors/errorMessages";
import { translationCache } from "@/lib/cache/translationCache";
import { translationDeduplicator } from "@/lib/performance/requestDeduplication";
import { normalizeUiCode } from "@/lib/constants/lang";

type LangCode = string;

interface TranslationMetrics {
  requestCount: number;
  cacheHits: number;
  totalLatency: number;
  avgLatency: number;
  errors: number;
}

function isAbortError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === "AbortError") return true;
  if (typeof err === "object" && err !== null) {
    const obj = err as Record<string, unknown>;
    const name = typeof obj.name === "string" ? obj.name : undefined;
    const code = typeof obj.code === "string" ? obj.code : undefined;
    const msg = typeof obj.message === "string" ? obj.message.toLowerCase() : "";
    return name === "AbortError" || code === "ABORT_ERR" || msg.includes("aborted") || msg.includes("signal is aborted");
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
  const reqIdRef = useRef(0);
  const prevTypedRef = useRef("");

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
      const uiSource = normalizeUiCode(sourceLang);
      const uiTarget = normalizeUiCode(targetLang);

      if (!text.trim()) {
        setOutputText("");
        setErrorMsg(null);
        lastTranslationRef.current = {
          input: "",
          output: "",
          sourceLang: uiSource,
          targetLang: uiTarget,
        };
        return;
      }

      const myId = ++reqIdRef.current;
      const trimmedText = text.slice(0, maxChars);
      const startTime = Date.now();

      // Cache pakai UI code yang sudah dinormalisasi
      const cachedResult = translationCache.getCachedTranslation(
        trimmedText,
        uiSource,
        uiTarget
      );
      if (cachedResult) {
        setOutputText(cachedResult);
        setErrorMsg(null);
        lastTranslationRef.current = {
          input: trimmedText,
          output: cachedResult,
          sourceLang: uiSource,
          targetLang: uiTarget,
        };
        setMetrics((p) => ({
          ...p,
          cacheHits: p.cacheHits + 1,
          requestCount: p.requestCount + 1,
        }));
        return;
      }

      controllerRef.current?.abort(new DOMException("new-input", "AbortError"));
      const ctrl = new AbortController();
      controllerRef.current = ctrl;

      setLoading(true);
      setErrorMsg(null);

      try {
        const dedupKey = `${trimmedText}:${uiSource}:${uiTarget}`;
        const translation = await translationDeduplicator.deduplicate(dedupKey, async () => {
          if (ctrl.signal.aborted) return null;

          let res: Response;
          try {
            res = await fetch("/api/translate/deepl", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal: ctrl.signal,
              body: JSON.stringify({
                text: trimmedText,
                targetLang: uiTarget,                   // UI code → backend yang mapping
                sourceLang: uiSource === "auto" ? undefined : uiSource,
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
          const result = typeof data === "string" ? data : data?.translations?.[0]?.text ?? "";
          return result;
        });

        if (translation == null) return; // canceled

        if (!translation) {
          throw new Error("Empty translation received");
        }

        translationCache.setCachedTranslation(
          trimmedText,
          uiSource,
          uiTarget,
          translation
        );

        if (myId !== reqIdRef.current) return; // stale

        setOutputText(translation);
        lastTranslationRef.current = {
          input: trimmedText,
          output: translation,
          sourceLang: uiSource,
          targetLang: uiTarget,
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

  const handleTextInput = useCallback(
    (value: string) => {
      setInputText(value);
      if (timerRef.current) clearTimeout(timerRef.current);

      const was = prevTypedRef.current;
      const isDeleting = value.length < was.length;
      prevTypedRef.current = value;

      if (isDeleting && outputText) {
        const last = lastTranslationRef.current;
        const baseLen = last.input.length || 1;
        const ratio = Math.max(0, Math.min(1, value.length / baseLen));
        const approx = Math.floor((last.output || outputText).length * ratio);
        setOutputText((prev) => (prev ? prev.slice(0, approx) : ""));
        setErrorMsg(null);
        setLoading(false);
      }

      if (!value.trim()) {
        controllerRef.current?.abort(new DOMException("empty", "AbortError"));
        setOutputText("");
        setErrorMsg(null);
        setLoading(false);
        const uiSource = normalizeUiCode(sourceLang);
        const uiTarget = normalizeUiCode(targetLang);
        lastTranslationRef.current = {
          input: "",
          output: "",
          sourceLang: uiSource,
          targetLang: uiTarget,
        };
        return;
      }

      const delay = isDeleting ? 150 : value.length < 100 ? 250 : value.length < 500 ? 350 : 500;
      timerRef.current = setTimeout(() => {
        void doTranslate(value);
      }, delay);
    },
    [doTranslate, outputText, sourceLang, targetLang]
  );

  useEffect(() => {
    if (outputText) {
      setOutputText("");
      setErrorMsg(null);
    }
    if (inputText.trim()) {
      void doTranslate(inputText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceLang, targetLang]);

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
    const uiSource = normalizeUiCode(sourceLang);
    const uiTarget = normalizeUiCode(targetLang);
    lastTranslationRef.current = {
      input: "",
      output: "",
      sourceLang: uiSource,
      targetLang: uiTarget,
    };
  }, [sourceLang, targetLang]);

  const performanceInfo = useMemo(() => {
    const cacheStats = translationCache.getStats();
    const deduplicationStats = translationDeduplicator.getStats();
    return {
      ...metrics,
      cacheHitRate: metrics.requestCount > 0 ? metrics.cacheHits / metrics.requestCount : 0,
      errorRate: metrics.requestCount > 0 ? metrics.errors / metrics.requestCount : 0,
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
