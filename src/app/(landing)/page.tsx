// src/app/(landing)/page.tsx
import dynamic from "next/dynamic";
import { toolCategories } from "@/features/landing/data/tools";
import { HeroSection, FeatureCategoryCard, FeatureListSimple } from '@/features/landing/components';

const SupportedFormats = dynamic(
  () => import("@/features/landing/components/SupportedFormats"),
  { loading: () => <div className="h-24" /> }
);


export default function LandingPage() {
  return (
    <>
    <HeroSection />

    <section className="py-6 max-w-5xl mx-auto">
        {/* Desktop version */}
        <div className="hidden sm:grid gap-5 sm:grid-cols-2 md:grid-cols-3 px-20">
          {toolCategories.map((category, i) => (
            <FeatureCategoryCard
              key={i}
              iconSrc={category.iconSrc}
              iconAlt={category.iconAlt}
              title={category.title}
              features={category.features}
              description={category.description}
            />
          ))}
        </div>
        {/* Mobile version */}
        <FeatureListSimple />
    </section>

      <SupportedFormats />
    </>
  );
}
