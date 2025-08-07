// src/lib/fonts/index.ts
import localFont from 'next/font/local';

export const fontFuturu = localFont({
  src: [
    { path: '../../assets/fonts/Futuru-Regular.woff2', weight: '400' },
    { path: '../../assets/fonts/Futuru-Semibold.woff2', weight: '600' },
    { path: '../../assets/fonts/Futuru-Bold.woff2', weight: '700' },
  ],
  variable: '--font-futuru', // PENTING
  display: 'swap',
});

export const fontSalmond = localFont({
  src: [
    { path: '../../assets/fonts/Salmond-Regular.woff', weight: '400' },
    { path: '../../assets/fonts/Salmond-Semibold.woff', weight: '600' },
    { path: '../../assets/fonts/Salmond-Bold.woff', weight: '700' },
  ],
  variable: '--font-salmond',
  display: 'swap',
});

export const fontMonda = localFont({
  src: [
    { path: '../../assets/fonts/Monda.woff', weight: '400' },
  ],
  variable: '--font-monda',
  display: 'swap',
});


export const fontPogonia = localFont({
  src: [
    { path: '../../assets/fonts/Pogonia-Thin.woff', weight: '100' },
    { path: '../../assets/fonts/Pogonia-ExtraLight.woff', weight: '200' },
    { path: '../../assets/fonts/Pogonia-Light.woff', weight: '300' },
    { path: '../../assets/fonts/Pogonia-Regular.woff', weight: '400' },
    { path: '../../assets/fonts/Pogonia-Medium.woff', weight: '500' },
    { path: '../../assets/fonts/Pogonia-Semibold.woff', weight: '600' },
    { path: '../../assets/fonts/Pogonia-Bold.woff', weight: '700' },
    { path: '../../assets/fonts/Pogonia-ExtraBold.woff', weight: '800' },
    { path: '../../assets/fonts/Pogonia-Black.woff', weight: '900' },
  ],
  variable: '--font-pogonia',
  display: 'swap',
});



export const allFontVars = [fontFuturu.variable, fontSalmond.variable, fontPogonia.variable, fontMonda.variable].join(' ');