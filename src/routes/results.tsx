import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/ResultCard";
import { useLang } from "@/lib/i18n";
import { TEST_RESULTS as R } from "@/lib/testResults";

export const Route = createFileRoute("/results")({
  head: () => ({ meta: [
    { title: "How well does it work? — Trust Shield" },
    { name: "description", content: "Trust Shield's media detection test results: fakes caught, false alarms and inconclusive answers." },
    { property: "og:title", content: "How well does it work? — Trust Shield" },
    { property: "og:description", content: "Honest test results, limits included." },
  ] }),
  component: Page,
});

function Page() {
  const { t, lang } = useLang();
  const tr = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const measured = R.fakesCaughtPct !== null && R.falseAlarmPct !== null && R.inconclusivePct !== null;
  const bars = [
    { label: tr("Fakes caught", "المزيّف الذي تم كشفه"), v: R.fakesCaughtPct, color: "var(--primary)" },
    { label: tr("False alarms", "إنذارات خاطئة"), v: R.falseAlarmPct, color: "var(--uae-red, #d9363e)" },
    { label: tr("Inconclusive", "غير حاسم"), v: R.inconclusivePct, color: "var(--warning, #e0a020)" },
  ];
  const stat = (label: string, v: number | null, suffix = "") => (
    <div className="glass p-5 text-center">
      <div className="text-4xl font-bold font-display">{v === null ? "—" : `${v}${suffix}`}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHead title={t("results")} sub={tr("We test our media detection on real and fake samples and publish the results — including what it gets wrong.",
        "نختبر كشف المقاطع على عينات حقيقية ومزيّفة وننشر النتائج، بما فيها الأخطاء.")} badge={measured ? tr("Measured", "تم القياس") : tr("Test in progress", "الاختبار جارٍ")} />
      <div className="grid sm:grid-cols-3 gap-4">
        {stat(tr("Samples tested", "عينات مختبرة"), R.total)}
        {stat(tr("Real samples", "عينات حقيقية"), R.real)}
        {stat(tr("Fake samples", "عينات مزيّفة"), R.fake)}
      </div>
      <div className="glass p-6 mt-6">
        <h3 className="font-semibold">{tr("Results", "النتائج")}</h3>
        <div className="mt-4 grid gap-4">
          {bars.map((b) => (
            <div key={b.label}>
              <div className="flex justify-between text-sm"><span>{b.label}</span><span className="font-semibold">{b.v === null ? "—" : `${b.v}%`}</span></div>
              <div className="h-4 rounded bg-muted mt-1 overflow-hidden"><div className="h-full rounded" style={{ width: `${b.v ?? 0}%`, background: b.color }} /></div>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-5">
          {tr(`Tested on ${R.total ?? "[X]"} samples. ${R.sources} Next: larger public datasets during our 90-day pilot.`,
            `تم الاختبار على ${R.total ?? "[X]"} عينة. ${R.sources} الخطوة التالية: مجموعات بيانات عامة أكبر خلال تجربتنا لمدة 90 يوماً.`)}
          {R.date ? ` (${R.date})` : ""}
        </p>
      </div>
      <div className="mt-6 rounded-xl border-s-4 border-warning bg-card/50 p-5 text-sm">
        {tr("AI detection is not perfect. That is why Trust Shield says “Inconclusive” instead of guessing, never says “safe”, and always tells you to verify before you pay.",
          "كشف الذكاء الاصطناعي ليس مثالياً. لذلك يقول درع الثقة «غير حاسم» بدلاً من التخمين، ولا يقول «آمن» أبداً، ويطلب منك دائماً التحقق قبل الدفع.")}
      </div>
    </div>
  );
}
