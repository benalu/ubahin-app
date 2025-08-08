// src/app/layout.tsx

import './globals.css';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import LayoutWrapper from '@/components/shared/LayoutWrapper';
import { allFontVars } from '@/lib/fonts';
import { Toaster } from 'sonner';
import MobileBottomNav from '@/components/shared/HeaderMobile';
import LogoMobile from '@/components/shared/Header/LogoMobile';

export const metadata = {
  title: 'Your App Name',
  description: 'Free file converter and translator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${allFontVars} antialiased`}>
      <body>
        <div className="hidden md:block">
          <Header />
        </div>
        <LogoMobile />
        <main className=" min-h-screen flex flex-col pb-24 sm:pb-0">
          <LayoutWrapper>{children}</LayoutWrapper>
        </main>
        <MobileBottomNav />
        <Footer />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
