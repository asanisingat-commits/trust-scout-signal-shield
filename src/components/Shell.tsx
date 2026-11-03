import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useLang, type Key } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M24 4 7 10.5v11.5c0 10.5 7.3 19.6 17 22 9.7-2.4 17-11.5 17-22V10.5L24 4Z" fill="var(--primary)" />
      <path d="m17 24 5 5 9-10" stroke="var(--primary-foreground)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SUN = "M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z";
const MOON = "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z";

const NAV: { to: string; k: Key }[] = [
  { to: "/", k: "navCheck" }, { to: "/learn", k: "learn" }, { to: "/results", k: "accuracy" },
];

export function Shell({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useLang();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const pill = "h-11 rounded-full border bg-card px-4 text-sm hover:border-primary transition-colors";
  const themeLabel = theme === "dark" ? (lang === "ar" ? "الوضع الفاتح" : "Light mode") : (lang === "ar" ? "الوضع الداكن" : "Dark mode");
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-6xl flex items-center gap-3 px-4 h-[72px]">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <Logo />
            <span className="font-display text-[22px] font-semibold">{lang === "ar" ? "درع الثقة" : "Trust Shield"}</span>
          </Link>
          <nav className="hidden lg:flex gap-1 ms-auto" aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="px-4 py-2.5 rounded-full text-[15px] text-muted-foreground hover:text-foreground transition-colors" activeProps={{ className: "!text-primary bg-secondary font-medium" }}>{t(n.k)}</Link>
            ))}
          </nav>
          <div className="ms-auto lg:ms-4 flex items-center gap-2">
            <button onClick={toggle} className={`${pill} w-11 px-0 grid place-items-center`} aria-label={themeLabel} title={themeLabel}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={theme === "dark" ? SUN : MOON} /></svg>
            </button>
            <button onClick={() => setLang(lang === "en" ? "ar" : "en")} className={pill}>{lang === "en" ? "العربية" : "English"}</button>
            <button onClick={() => setOpen(!open)} className={`${pill} lg:hidden`} aria-label="Menu" aria-expanded={open}>☰</button>
          </div>
        </div>
        {open && (
          <nav className="lg:hidden border-t px-4 py-2 grid gap-1" aria-label="Main">
            {NAV.map((n) => <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="px-3 py-3 rounded-lg text-sm" activeOptions={{ exact: true }} activeProps={{ className: "text-primary bg-secondary" }}>{t(n.k)}</Link>)}
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t mt-16 py-8 text-center text-sm text-muted-foreground">
        <div className="flex justify-center items-center gap-2 mb-2"><Logo size={20} /> Trust Shield</div>
        <div className="text-xs">Built for UAE Hackathon 2026 · Challenge 40: Building Trust in Digital Content</div>
      </footer>
    </div>
  );
}
