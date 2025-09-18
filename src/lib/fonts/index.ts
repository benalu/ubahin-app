// src/lib/fonts/index.ts
import localFont from 'next/font/local';

export const fontFuturu = localFont({
  src: [
    { path: '../../assets/fonts/Futuru-Regular.woff2', weight: '400' },
  ],
  variable: '--font-futuru', // PENTING
  display: 'swap',
  preload: false,
});

export const fontSalmond = localFont({
  src: [
    { path: '../../assets/fonts/Salmond-Regular.woff', weight: '400' },
  ],
  variable: '--font-salmond',
  display: 'swap',
  preload: false,
});

export const fontMonda = localFont({
  src: [
    { path: '../../assets/fonts/Monda.woff', weight: '400' },
  ],
  variable: '--font-monda',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'Segoe UI', 'Arial'],
});


export const fontPogonia = localFont({
  src: [
    { path: '../../assets/fonts/Pogonia-Regular.woff', weight: '400' },
    { path: '../../assets/fonts/Pogonia-Bold.woff', weight: '700' },

  ],
  variable: '--font-pogonia',
  display: 'swap',
  preload: false,
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});



export const allFontVars = [fontFuturu.variable, fontSalmond.variable, fontPogonia.variable, fontMonda.variable].join(' ');