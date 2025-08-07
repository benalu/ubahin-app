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
    <Card className="w-full h-[175px] p-4 shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-secondary">
      <CardHeader className="flex items-center gap-3">
        <Image
            src={iconSrc}
            alt={iconAlt}
            width={32}
            height={32}
            className="w-8 h-8"
          />
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>

      <CardContent className="text-sm text-muted-foreground space-y-1">
        {/* Desktop: show description */}
        <p className="hidden sm:block">{description}</p>

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
