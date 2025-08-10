// src/features/landing/components/FeatureCategoryCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";
import React from "react";

interface FeatureCategoryCardProps {
  iconSrc: string;
  iconAlt: string;
  title: string;
  features: string[];
  description: string;
}

export default function FeatureCategoryCard({
  iconSrc,
  iconAlt,
  title,
  features,
  description,
}: FeatureCategoryCardProps) {
  return (
    <Card className="w-full min-h-[175px] p-4 shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-secondary cursor-pointer">
      <CardHeader className="flex items-start gap-3 pb-2">
        <Image
          src={iconSrc}
          alt={iconAlt}
          width={32}
          height={32}
          className="w-8 h-8 shrink-0"
        />
        <CardTitle className="text-base md:text-lg font-semibold leading-snug">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="text-xs md:text-sm text-muted-foreground space-y-1 leading-snug">
        {/* Tablet & desktop: show description (clamped) */}
        <p className="hidden sm:block md:line-clamp-3">
          {description}
        </p>

        {/* Mobile: show feature list */}
        <div className="block sm:hidden space-y-1">
          {features.map((feature, idx) => (
            <p key={idx}>• {feature}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
