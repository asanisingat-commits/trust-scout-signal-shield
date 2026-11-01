import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { analyzeUrl, type Result } from "@/lib/detect";
import { ResultCard, PageHead, Samples, inputCls, btnCls } from "@/components/ResultCard";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/scan/url")({
  head: () => ({ meta: [
    { title: "Link & Website Scanner — Trust Shield" }, { name: "description", content: "Check links for phishing patterns and UAE brand impersonation." },
    { property: "og:title", content: "Link & Website Scanner — Trust Shield" }, { property: "og:description", content: "Detect phishing links and look-alike domains." },
  ] }),
  component: Page,
});

const SAMPLES = [
  { label: "Fake bank login", value: "http://emiratesnbd-secure-login.xyz/verify-account" },
  { label: "Fake courier", value: "https://emiratespost-delivery.top/pay-fee" },
  { label: "@ trick", value: "https://www.dubaipolice.gov.ae@198.51.100.7/fine" },
  { label: "Official site", value: "https://www.dubaipolice.gov.ae" },
];

function Page() {
  const { t } = useLang();
  const [v, setV] = useState(""); const [r, setR] = useState<Result | null>(null);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageHead title={t("url")} sub="Paste any link. We analyse its structure safely — the link is never opened and no website code is executed." badge="Rule-based · LIVE" />
      <form onSubmit={(e) => { e.preventDefault(); if (v.trim()) setR(analyzeUrl(v.slice(0, 2000))); }} className="flex flex-col sm:flex-row gap-3">
        <input value={v} onChange={(e) => setV(e.target.value)} placeholder="https://example.com/..." className={inputCls} dir="ltr" maxLength={2000} />
        <button className={btnCls} disabled={!v.trim()}>{t("analyze")}</button>
      </form>
      <Samples items={SAMPLES} onPick={(x) => { setV(x); setR(analyzeUrl(x)); }} />
      {r && <ResultCard r={r} />}
      <p className="mt-6 text-xs text-muted-foreground">Domain reputation lookups (e.g. Google Safe Browsing, VirusTotal) are planned and will run server-side once API keys are configured.</p>
    </div>
  );
}
