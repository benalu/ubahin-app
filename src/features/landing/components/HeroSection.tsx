// src/features/landing/components/HeroSection.tsx
import { Button } from "@/components/ui/button";
import { Languages, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HerosSection() {
  return (
    <section className="relative py-8 md:py-12 px-4">
      <div className="max-w-3xl mx-auto text-center">
        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-bold mb-3">
          Translate & Convert
          <br />
          <span className="text-primary font-pogonia op-dlig op-salt op-ss01">
            secara instant
          </span>
        </h1>

        {/* Simple subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground mb-5 max-w-xl mx-auto">
          Terjemahkan teks dan convert file dengan mudah. Gratis, cepat, dan aman.
        </p>

        {/* Enhanced CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-5">
          <Button 
            asChild 
            size="lg" 
            className="group relative text-lg px-8 py-3 bg-gradient-to-r from-secondary to-indigo-600 hover:from-secondary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Link href="/translate" className="flex items-center gap-2">
              <Languages className="w-5 h-5" />
              Translate
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="outline" 
            size="lg" 
            className="group relative text-lg px-8 py-3 border-2 border-primary/20 hover:border-primary/40 bg-background/50 backdrop-blur-sm hover:bg-primary/5 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Link href="/file-conversion" className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Convert
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100" />
            </Link>
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span>Tanpa Registrasi</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span>100% Gratis</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span>Proses di Browser</span>
          </div>
        </div>
      </div>
    </section>
  );
}