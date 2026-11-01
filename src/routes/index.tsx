import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { Logo } from "@/components/Shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trust Shield — Stop Scams. Verify the Truth." },
      { name: "description", content: "Free UAE scam checker for links, messages, phone numbers and IBANs, with transparent explanations." },
      { property: "og:title", content: "Trust Shield — Stop Scams. Verify the Truth." },
      { property: "og:description", content: "Detect. Verify. Protect. Scam and misinformation checks built for the UAE." },
    ],
  }),
  component: Index,
});

const MODULES = [
  { to: "/scan/url", icon: "🔗", k: "url", d: "Phishing patterns, look-alike domains, brand impersonation.", live: true },
  { to: "/scan/message", icon: "💬", k: "message", d: "WhatsApp, SMS, email & social messages.", live: true },
  { to: "/scan/phone", icon: "📞", k: "phone", d: "UAE +971 & international number validation.", live: true },
  { to: "/scan/bank", icon: "🏦", k: "bank", d: "UAE IBAN checksum + payment-request analysis.", live: true },
  { to: "/media", icon: "🖼️", k: "media", d: "Photo, video & news claim verification.", live: false },
  { to: "/learn", icon: "🛡️", k: "learn", d: "UAE scam awareness and safety tips.", live: true },
] as const;

function Index() {
  const { t } = useLang();
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-5xl px-4 pt-20 pb-16 text-center">
          <div className="mx-auto w-fit animate-pulse-glow"><Logo size={96} /></div>
          <p className="mt-6 text-primary tracking-[0.3em] uppercase text-sm">{t("tagline")}</p>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold leading-tight">{t("heroTitle")}</h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">{t("heroSub")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/scan/message" className="rounded-lg bg-primary text-primary-foreground font-semibold px-6 py-3 glow hover:brightness-110">{t("startScan")}</Link>
            <Link to="/scan/url" className="rounded-lg border px-6 py-3 hover:border-primary">{t("scanUrl")}</Link>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">🔒 {t("privacy")}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => (
          <Link key={m.to} to={m.to} className="glass p-6 group hover:border-primary hover:-translate-y-1 transition-all">
            <div className="flex justify-between"><span className="text-3xl">{m.icon}</span>
              <span className={`text-[10px] h-fit rounded-full px-2 py-0.5 ${m.live ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning"}`}>{m.live ? "LIVE" : t("comingSoon")}</span></div>
            <h3 className="mt-4 text-lg font-semibold group-hover:text-primary">{t(m.k)}</h3>
            <p className="text-sm text-muted-foreground mt-1">{m.d}</p>
          </Link>
        ))}
      </section>
      <section className="mx-auto max-w-6xl px-4 mt-12 grid md:grid-cols-3 gap-4 text-sm">
        {[["Transparent", "Every point in a risk score comes from a named, explained rule — no black box, no random numbers."], ["Private", "Scans run in your browser. Nothing you paste is stored or sent anywhere."], ["Honest", "We never say something is safe just because we found nothing. Inconclusive means inconclusive."]].map(([h, p]) => (
          <div key={h} className="rounded-xl border-s-4 border-primary bg-card/50 p-5"><div className="font-semibold">{h}</div><p className="text-muted-foreground mt-1">{p}</p></div>
        ))}
      </section>
    </>
  );
}
