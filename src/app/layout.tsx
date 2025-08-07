// src/app/layout.tsx

import './globals.css';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import LayoutWrapper from '@/components/shared/LayoutWrapper';
import { allFontVars } from '@/lib/fonts';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Your App Name',
  description: 'Free file converter and translator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${allFontVars} antialiased`}>
      <body>
        <Header />
        <main className=" min-h-screen flex flex-col">
          <LayoutWrapper>{children}</LayoutWrapper>
        </main>
        <Footer />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
