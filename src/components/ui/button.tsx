// src/components/ui/button.tsx
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // base
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-50 ring-offset-background " +
    // default icon size (akan dioverride oleh size varian)
    "[&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg]:h-4 [&>svg]:w-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon:
        // ukuran tombol
          "h-11 w-11 rounded-xl " +
          // besarkan ikon di dalam button (override default)
          "[&>svg]:h-6 [&>svg]:w-6 " +
          // responsive: lebih besar di ≥sm
          "sm:h-12 sm:w-12 sm:[&>svg]:h-6 sm:[&>svg]:w-6",
        select:
          "h-8 px-2 rounded-md " +
          "[&>svg]:h-5 [&>svg]:w-5 " + // chevron 20px
          "sm:h-11 sm:px-3 sm:[&>svg]:h-6 sm:[&>svg]:w-6",
        swap:
          // ukuran tombol
          "h-12 w-12 rounded-xl " +
          // besarkan ikon di dalam button (override default)
          "[&>svg]:h-6 [&>svg]:w-6 " +
          // responsive: lebih besar di ≥sm
          "sm:h-12 sm:w-12 sm:[&>svg]:h-6 sm:[&>svg]:w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
