// src/app/(landing)/page.tsx
import dynamic from "next/dynamic";
import { HeroSection } from '@/features/landing/components';

const SupportedFormats = dynamic(
  () => import("@/features/landing/components/SupportedFormats"),
  { loading: () => <div className="h-24" /> }
);

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <div className="w-full flex justify-center my-8 md:my-12">
        <div className="border-t border-gray-300 w-full max-w-[708px]" />
      </div>
      <SupportedFormats />
    </>
  );
}