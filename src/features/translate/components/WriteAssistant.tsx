// src/features/translate/components/WriteAssistant.tsx
"use client";

import { Sparkles } from "lucide-react";

type Props = {
  className?: string;
};

export default function WriteAssistant({ className = "" }: Props) {
  return (
    <div
      id="panel-write"
      role="tabpanel"
      aria-labelledby="tab-write"
      className={`text-center py-20 ${className}`}
    >
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
          AI Writing Assistant
        </h3>
        <p className="text-gray-600 leading-relaxed">
          Enhance your writing with AI-powered tools for grammar, style, and translation assistance.
        </p>
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">Coming soon with advanced features</p>
        </div>
      </div>
    </div>
  );
}
