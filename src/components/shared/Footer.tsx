// src/components/shared/Footer.tsx
export default function Footer() {
  return (
    <footer className="hidden sm:hidden md:block border-t py-4 text-center text-sm text-muted-foreground  ">
      © {new Date().getFullYear()} <span className="font-monda font-bold op-dlig op-salt op-ss01 tracking-[.30em]">UBAHIN</span>. All rights reserved.
    </footer>
  );
}
