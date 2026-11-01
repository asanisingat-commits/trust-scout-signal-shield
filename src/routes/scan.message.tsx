import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { analyzeMessage, type Result } from "@/lib/detect";
import { ResultCard, PageHead, Samples, inputCls, btnCls } from "@/components/ResultCard";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/scan/message")({
  head: () => ({ meta: [
    { title: "Message Scam Detector — Trust Shield" }, { name: "description", content: "Paste WhatsApp, SMS, email or social messages to detect scam patterns." },
    { property: "og:title", content: "Message Scam Detector — Trust Shield" }, { property: "og:description", content: "Spot fake prizes, OTP theft and impersonation." },
  ] }),
  component: Page,
});

const PLATFORMS = ["WhatsApp", "SMS", "Email", "Instagram", "Telegram", "Facebook", "TikTok"];
const SAMPLES = [
  { label: "Fake police fine", value: "Dubai Police: You have an unpaid traffic fine of AED 300. Pay immediately within 24 hours to avoid your Emirates ID being blocked: http://dubaipolice-fines.top/pay" },
  { label: "Fake prize", value: "CONGRATULATIONS! You have won AED 50,000 in the Etisalat lucky draw. To claim, reply with the OTP sent to your phone. Don't tell anyone!" },
  { label: "Courier fee", value: "Emirates Post: Your package is held at customs. A clearance fee of AED 12.50 is required. Click the link: emiratespost-ae.xyz/track" },
  { label: "Job scam", value: "Part-time job! Like videos and earn AED 500 daily. Small deposit in USDT required to unlock task commission." },
  { label: "Normal message", value: "Hi Sara, are we still meeting for coffee at 5 tomorrow?" },
];

function Page() {
  const { t } = useLang();
  const [v, setV] = useState(""); const [p, setP] = useState("WhatsApp"); const [r, setR] = useState<Result | null>(null);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageHead title={t("message")} sub="Paste a suspicious message. We check it against known UAE scam patterns in English and Arabic." badge="Rule-based · LIVE" />
      <div className="flex flex-wrap gap-2 mb-3">{PLATFORMS.map((x) => <button key={x} onClick={() => setP(x)} className={`text-xs rounded-full px-3 py-1 border ${p === x ? "border-primary text-primary bg-primary/10" : ""}`}>{x}</button>)}</div>
      <textarea value={v} onChange={(e) => setV(e.target.value)} rows={6} maxLength={5000} placeholder={`Paste the ${p} message here…`} className={inputCls} />
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-muted-foreground">{v.length}/5000</span>
        <button onClick={() => v.trim() && setR(analyzeMessage(v))} className={btnCls} disabled={!v.trim()}>{t("analyze")}</button>
      </div>
      <Samples items={SAMPLES} onPick={(x) => { setV(x); setR(analyzeMessage(x)); }} />
      {r && <ResultCard r={r} />}
      <div className="mt-8 glass p-4 text-sm text-muted-foreground">
        <span className="text-warning font-semibold">{t("comingSoon")}:</span> screenshot upload with AI text extraction, AI-assisted analysis, and automatic scanning via authorised platform integrations.
      </div>
    </div>
  );
}
