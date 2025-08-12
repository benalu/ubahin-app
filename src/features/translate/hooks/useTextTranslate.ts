// src/features/translate/hooks/useTextTranslate.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toastError } from "@/lib/errors/notify";
import { createNetworkError, getErrorMessage } from "@/lib/errors/errorMessages";

type LangCode = string;

type ApiSuccess = {
  translations: Array<{ detected_source_language?: string; text: string }>;
};

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

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const doTranslate = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        setOutputText("");
        setErrorMsg(null);
        return;
      }

      const trimmed = text.slice(0, maxChars + 100);

      controllerRef.current?.abort();
      const ctrl = new AbortController();
      controllerRef.current = ctrl;

      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch("/api/translate/deepl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ctrl.signal,
          body: JSON.stringify({
            text: trimmed,
            targetLang,
            sourceLang: sourceLang === "auto" ? undefined : sourceLang,
          }),
        });

        const ct = res.headers.get("content-type") || "";
        const isJson = ct.toLowerCase().includes("application/json");

        if (!res.ok) {
          const em = createNetworkError(res.status, "convert");
          setErrorMsg(em.message);
          toastError(em);
          setOutputText("");
          // consume body to free stream
          if (isJson) { await res.json().catch(() => undefined); } else { await res.text().catch(() => undefined); }
          return;
        }

        const data = (isJson ? await res.json() : await res.text()) as ApiSuccess | string;
        const translated =
          typeof data === "string" ? data : data?.translations?.[0]?.text ?? "";

        setOutputText(translated);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const em = getErrorMessage(err instanceof Error ? err : String(err), { operation: "convert" });
        setErrorMsg(em.message);
        toastError(em);
        setOutputText("");
      } finally {
        setLoading(false);
      }
    },
    [sourceLang, targetLang, maxChars]
  );

  const handleTextInput = useCallback(
    (value: string) => {
      setInputText(value);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        void doTranslate(value);
      }, 350);
    },
    [doTranslate]
  );

  // Auto-translate ketika bahasa berubah (jika ada input)
  useEffect(() => {
    if (inputText.trim()) {
      void doTranslate(inputText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceLang, targetLang]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const clearAll = useCallback(() => {
    controllerRef.current?.abort();
    if (timerRef.current) clearTimeout(timerRef.current);
    setInputText("");
    setOutputText("");
    setErrorMsg(null);
  }, []);

  return {
    inputText,
    outputText,
    errorMsg,
    loading,
    handleTextInput,
    clearAll,
    doTranslate, // diekspos kalau mau dipakai manual
  };
}
