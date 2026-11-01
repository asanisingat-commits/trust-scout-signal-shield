import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { analyzePhone } from "@/lib/detect";
import { ResultCard, PageHead, Samples, inputCls, btnCls } from "@/components/ResultCard";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/scan/phone")({
  head: () => ({ meta: [
    { title: "Phone Number Checker — Trust Shield" }, { name: "description", content: "Validate UAE +971 and international phone numbers." },
    { property: "og:title", content: "Phone Number Checker — Trust Shield" }, { property: "og:description", content: "Check phone number format and origin." },
  ] }),
  component: Page,
});

function Page() {
  const { t } = useLang();
  const [v, setV] = useState(""); const [r, setR] = useState<ReturnType<typeof analyzePhone> | null>(null);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageHead title={t("phone")} sub="Validate a number's format and origin. We cannot confirm a number is safe — only flag warning signs." badge="Rule-based · LIVE" />
      <form onSubmit={(e) => { e.preventDefault(); if (v.trim()) setR(analyzePhone(v)); }} className="flex flex-col sm:flex-row gap-3">
        <input value={v} onChange={(e) => setV(e.target.value)} placeholder="+971 50 123 4567" className={inputCls} dir="ltr" maxLength={30} />
        <button className={btnCls} disabled={!v.trim()}>{t("analyze")}</button>
      </form>
      <Samples items={[{ label: "UAE mobile", value: "050 123 4567" }, { label: "Foreign number", value: "+234 803 555 0101" }, { label: "Invalid", value: "+971 12 34" }]} onPick={(x) => { setV(x); setR(analyzePhone(x)); }} />
      {r && <ResultCard r={r.result} extra={
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          {[["Valid format", r.valid ? "Yes" : "No"], ["Normalised", r.normalized ?? "—"], ["Country", r.country], ["Type", r.type]].map(([a, b]) => <div key={a} className="rounded-lg bg-muted/60 p-3"><div className="text-xs text-muted-foreground">{a}</div><div className="font-medium" dir="ltr">{b}</div></div>)}
        </div>} />}
    </div>
  );
}
