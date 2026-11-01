import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useLang, type Key } from "@/lib/i18n";

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden className="drop-shadow-[0_0_10px_var(--primary)]">
      <path d="M24 3 6 10v12c0 11 7.7 20.6 18 23 10.3-2.4 18-12 18-23V10L24 3Z" stroke="var(--primary)" strokeWidth="2.5" fill="color-mix(in oklab, var(--primary) 12%, transparent)" />
      <path d="m16 24 6 6 11-12" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NAV: { to: string; k: Key }[] = [
  { to: "/", k: "home" }, { to: "/scan/url", k: "url" }, { to: "/scan/message", k: "message" }, { to: "/scan/phone", k: "phone" },
  { to: "/scan/bank", k: "bank" }, { to: "/media", k: "media" }, { to: "/learn", k: "learn" },
];

export function Shell({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col">
      <div className="uae-stripe" />
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-7xl flex items-center gap-4 px-4 h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Logo />
            <div className="leading-tight">
              <div className="font-display font-bold tracking-wider">TRUST SHIELD</div>
              <div className="text-[10px] text-primary tracking-widest uppercase">{t("tagline")}</div>
            </div>
          </Link>
          <nav className="hidden lg:flex gap-1 mx-auto">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors" activeProps={{ className: "!text-primary bg-primary/10" }}>{t(n.k)}</Link>
            ))}
          </nav>
          <button onClick={() => setLang(lang === "en" ? "ar" : "en")} className="ms-auto lg:ms-0 rounded-md border px-3 py-1.5 text-sm hover:border-primary">{lang === "en" ? "العربية" : "English"}</button>
          <button onClick={() => setOpen(!open)} className="lg:hidden rounded-md border px-3 py-1.5 text-sm" aria-label="Menu">☰</button>
        </div>
        {open && (
          <nav className="lg:hidden border-t px-4 py-2 grid gap-1">
            {NAV.map((n) => <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-sm">{t(n.k)}</Link>)}
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t mt-16 py-8 text-center text-sm text-muted-foreground">
        <div className="flex justify-center items-center gap-2 mb-2"><Logo size={20} /> Trust Shield · UAE Hackathon, Sharjah</div>

      </footer>
    </div>
  );
}
