// src/components/shared/Footer.tsx
export default function Footer() {
  return (
    <footer className="hidden sm:hidden md:block border-t py-4 text-center text-sm text-muted-foreground font-mono bg-white/50 backdrop-blur-sm">
      <span className="inline-block px-2 py-1 bg-[#23272e] rounded text-[#6E8CFB] font-bold tracking-wide">
        {'<'}UBAHIN{' />'}
      </span>
      <span className="mx-2 text-gray-900">{'<span>'}</span>
      <span className="text-sm text-gray-900">
        Made with 💙 from BNDR 
      </span>
      <span className="mx-2 text-gray-900">{'</span>'}</span>
      <a
        href="https://saweria.co/pxpy2"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-2 py-1 bg-[#23272e] rounded text-yellow-400 hover:bg-yellow-900 transition-colors font-mono text-xs font-semibold"
        aria-label="Saweria"
      >
        <span>{'<'}SAWERIA{' />'}</span>
        <span className="text-yellow-300">$</span>
      </a>
    </footer>
  );
}
