// src/features/translate/hooks/useTTS.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type SpeakOptions = {
  lang?: string;       // BCP-47 (mis. "id-ID", "en-US")
  rate?: number;       // 0.1 - 10 (default 1)
  pitch?: number;      // 0 - 2 (default 1)
  volume?: number;     // 0 - 1 (default 1)
  voiceName?: string;  // nama voice spesifik (opsional)
  onEnd?: () => void;  // callback selesai (opsional)
};

// Peta sederhana LangCode -> BCP-47
const LOCALE_MAP: Record<string, string> = {
  id: "id-ID",
  en: "en-US",
  "en-GB": "en-GB",
  de: "de-DE",
  fr: "fr-FR",
  it: "it-IT",
  es: "es-ES",
  pt: "pt-PT",
  "pt-BR": "pt-BR",
  nl: "nl-NL",
  pl: "pl-PL",
  ru: "ru-RU",
  ja: "ja-JP",
  ko: "ko-KR",
  zh: "zh-CN",
};

export function mapLangToLocale(code: string | undefined) {
  if (!code) return "id-ID";
  // kalau sudah BCP-47, pakai apa adanya
  if (code.includes("-")) return code;
  return LOCALE_MAP[code] || "en-US";
}

export function useTTS(defaultLocale = "id-ID") {
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const [speaking, setSpeaking] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[] | null>(null);
  const cancelRef = useRef<() => void>(() => {});
  const mountedRef = useRef(false);

  // Muat daftar voice (asinkron di beberapa browser)
  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      const v = synth.getVoices();
      if (v?.length) voicesRef.current = v;
    };
    loadVoices();
    synth.onvoiceschanged = loadVoices;
  }, [supported]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const pickVoice = useCallback((locale: string, voiceName?: string) => {
    const voices = voicesRef.current || window.speechSynthesis.getVoices();
    if (!voices?.length) return undefined;
    if (voiceName) {
      const byName = voices.find((v) => v.name === voiceName);
      if (byName) return byName;
    }
    // Cari yang lang-nya cocok, prioritas prefix
    const exact = voices.find((v) => v.lang === locale);
    if (exact) return exact;
    const prefix = locale.split("-")[0];
    const byPrefix = voices.find((v) => v.lang?.startsWith(prefix));
    return byPrefix || voices[0];
  }, []);

  const cancel = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string, opts: SpeakOptions = {}) => {
      if (!supported || !text?.trim()) return;

      // hentikan dulu kalau ada yang sedang jalan
      window.speechSynthesis.cancel();
      setSpeaking(true);

      const {
        lang = defaultLocale,
        rate = 1,
        pitch = 1,
        volume = 1,
        voiceName,
        onEnd,
      } = opts;

      const voice = pickVoice(lang, voiceName);

      // Pecah teks agar stabil di semua browser
      const chunkSize = 180;
      const chunks =
        text.match(new RegExp(`.{1,${chunkSize}}(\\s|$)`, "g")) || [text];

      let stopped = false;
      cancelRef.current = () => {
        stopped = true;
        window.speechSynthesis.cancel();
        setSpeaking(false);
      };

      chunks.forEach((part, i) => {
        const u = new SpeechSynthesisUtterance(part.trim());
        u.lang = lang;
        if (voice) u.voice = voice;
        u.rate = rate;
        u.pitch = pitch;
        u.volume = volume;

        if (i === chunks.length - 1) {
          u.onend = () => {
            if (stopped) return;
            setSpeaking(false);
            onEnd?.();
          };
          u.onerror = () => setSpeaking(false);
        }
        window.speechSynthesis.speak(u);
      });
    },
    [defaultLocale, pickVoice, supported]
  );

  return useMemo(
    () => ({ supported, speaking, speak, cancel, mapLangToLocale }),
    [supported, speaking, speak, cancel]
  );
}

