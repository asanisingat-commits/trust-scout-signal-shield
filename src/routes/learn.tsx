import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/ResultCard";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/learn")({
  head: () => ({ meta: [
    { title: "UAE Scam Awareness — Trust Shield" }, { name: "description", content: "Common UAE scams and how to protect yourself." },
    { property: "og:title", content: "UAE Scam Awareness — Trust Shield" }, { property: "og:description", content: "Learn to spot the most common scams in the UAE." },
  ] }),
  component: Page,
});

const SCAMS = [
  ["Fake traffic fines", "Messages claiming to be from police or RTA asking you to pay a fine through a link. Check fines only in official apps."],
  ["Courier & customs fees", "Fake Emirates Post / Aramex texts asking for a small fee to release a parcel."],
  ["Bank & Emirates ID blocking", "Callers pretending to be your bank or ICP asking for OTPs to 'update' your account."],
  ["Prize & lucky draws", "You 'won' a draw you never entered and must pay a fee or share codes to claim."],
  ["Job & task scams", "Paid to like videos, then asked for deposits to unlock commissions."],
  ["Fake rental & visa offers", "Too-good-to-be-true apartments or visas requiring advance payment."],
];
const TIPS = ["Never share OTP, PIN, CVV or UAE Pass credentials.", "Call organisations on numbers from their official website.", "Pause before acting on urgent messages.", "Enable two-factor authentication on WhatsApp and email.", "Verify news with official sources before forwarding."];

function Page() {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHead title={t("learn")} sub="The most common scams targeting UAE residents, and simple habits that stop them." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SCAMS.map(([h, d]) => <div key={h} className="glass p-5"><h3 className="font-semibold text-primary">{h}</h3><p className="text-sm text-muted-foreground mt-1">{d}</p></div>)}
      </div>
      <h2 className="text-2xl font-bold mt-10">Golden rules</h2>
      <ul className="mt-4 grid gap-2">{TIPS.map((x) => <li key={x} className="flex gap-3 items-start"><span className="text-primary">✓</span>{x}</li>)}</ul>
      <div className="mt-10 grid sm:grid-cols-3 gap-4 text-sm">
        {[["Emergency", "999"], ["Dubai Police eCrime", "ecrime.ae"], ["Aman service", "8002626"]].map(([a, b]) => <div key={a} className="rounded-xl border-s-4 border-uae-red bg-card/50 p-4"><div className="text-muted-foreground">{a}</div><div className="text-lg font-semibold" dir="ltr">{b}</div></div>)}
      </div>
    </div>
  );
}
