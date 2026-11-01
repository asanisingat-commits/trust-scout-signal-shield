import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { validateIban, analyzeMessage, type Result } from "@/lib/detect";
import { ResultCard, PageHead, Samples, inputCls, btnCls } from "@/components/ResultCard";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/scan/bank")({
  head: () => ({ meta: [
    { title: "Bank & IBAN Checker — Trust Shield" }, { name: "description", content: "Validate UAE IBANs and analyse suspicious payment requests." },
    { property: "og:title", content: "Bank & IBAN Checker — Trust Shield" }, { property: "og:description", content: "IBAN checksum validation and payment request analysis." },
  ] }),
  component: Page,
});

function Page() {
  const { t } = useLang();
  const [iban, setIban] = useState(""); const [req, setReq] = useState("");
  const [res, setRes] = useState<{ v: ReturnType<typeof validateIban>; r: Result | null } | null>(null);
  const run = (i = iban, q = req) => setRes({ v: validateIban(i), r: q.trim() ? analyzeMessage(q) : null });
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageHead title={t("bank")} sub="Check an IBAN's structure and analyse the payment request that came with it. Your IBAN is masked and never stored." badge="Rule-based · LIVE" />
      <div className="grid gap-3">
        <input value={iban} onChange={(e) => setIban(e.target.value)} placeholder="AE07 0331 2345 6789 0123 456" className={inputCls + " font-mono"} dir="ltr" maxLength={40} autoComplete="off" />
        <textarea value={req} onChange={(e) => setReq(e.target.value)} rows={4} maxLength={3000} placeholder="Optional: paste the payment request message…" className={inputCls} />
        <button onClick={() => iban.trim() && run()} className={btnCls + " w-fit"} disabled={!iban.trim()}>{t("analyze")}</button>
      </div>
      <Samples items={[{ label: "Valid UAE IBAN + urgent request", value: "AE070331234567890123456|URGENT: our company account changed. Transfer AED 18,000 to the new account immediately, keep this confidential." }, { label: "Mistyped IBAN", value: "AE080331234567890123456|" }]}
        onPick={(x) => { const [a = "", b = ""] = x.split("|"); setIban(a); setReq(b); run(a, b); }} />
      {res && (
        <div className="glass p-6 mt-6">
          <div className="font-mono text-lg" dir="ltr">{res.v.masked}</div>
          <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
            {[["UAE IBAN", res.v.isUae ? "Yes" : "No"], ["Format", res.v.formatOk ? "✓ Correct" : "✗ Incorrect"], ["Checksum (mod-97)", res.v.checksumOk ? "✓ Passes" : "✗ Fails"]].map(([a, b]) => <div key={a} className="rounded-lg bg-muted/60 p-3"><div className="text-xs text-muted-foreground">{a}</div><div className="font-medium">{b}</div></div>)}
          </div>
          {res.v.bankCode && <p className="text-xs text-muted-foreground mt-2">Bank identifier code: {res.v.bankCode}</p>}
          <div className="mt-4 rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm text-warning">
            ⚠ A valid IBAN only means the number is correctly formed. It does NOT prove the account belongs to who they claim or that it is trustworthy.
          </div>
        </div>
      )}
      {res?.r && <ResultCard r={res.r} />}
    </div>
  );
}
