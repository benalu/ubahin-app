// src/features/translate/components/partials/language-selector/SwapButton.tsx

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";

interface SwapButtonProps {
  onSwap: () => void;
  disabled?: boolean;
}

const SwapButton = memo(function SwapButton({ onSwap, disabled }: SwapButtonProps) {
  return (
    <div className="flex justify-center">
      <Button
        type="button"
        variant="ghost"
        size="swap"
        className="bg-white"
        onClick={onSwap}
        disabled={disabled}
        title="Swap (Ctrl/Cmd+K)"
        aria-label="Tukar bahasa"
      >
        <ArrowLeftRight className="text-gray-700" />
      </Button>
    </div>
  );
});

export default SwapButton;