import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/ResultCard";
import { useLang } from "@/lib/i18n";
import { TEST_RESULTS as R, pct } from "@/lib/testResults";

export const Route = createFileRoute("/results")({
  head: () => ({ meta: [
    { title: "How accurate is it? — Trust Shield" },
    { name: "description", content: "Trust Shield tested on 18,824 public SMS messages: how many scams it flags and how often it wrongly flags normal messages." },
    { property: "og:title", content: "How accurate is it? — Trust Shield" },
    { property: "og:description", content: "Measured on public datasets, misses included." },
  ] }),
  component: Page,
});

const n = (x: number) => x.toLocaleString("en-US");

function Bar({ label, value, sub, tone }: { label: string; value: number; sub: string; tone: "primary" | "danger" | "warning" }) {
  const color = tone === "primary" ? "var(--primary)" : tone === "danger" ? "var(--destructive)" : "var(--warning)";
  return (
    <div>
      <div className="flex justify-between gap-4 text-sm"><span>{label}</span><span className="font-semibold">{value}%</span></div>
      <div className="h-3 rounded-full bg-muted mt-1.5 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.max(value, 0.6)}%`, background: color }} /></div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

function Page() {
  const { lang } = useLang();
  const tr = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const scams = R.datasets.reduce((s, d) => s + d.scams, 0);
  const normal = R.datasets.reduce((s, d) => s + d.normal, 0);
  const fa = R.datasets.reduce((s, d) => s + d.falseAlarms, 0);
  const stat = (label: string, v: string) => (
    <div className="glass p-5 text-center">
      <div className="text-4xl font-semibold font-display">{v}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHead title={tr("How accurate is it?", "ما مدى الدقة؟")}
        sub={tr("We ran our message check on public research datasets and publish every number — including what it misses.",
          "شغّلنا فحص الرسائل على مجموعات بيانات بحثية عامة وننشر كل الأرقام، بما فيها ما يفوتنا.")}
        badge={tr(`Measured · ${R.date}`, `تم القياس · ${R.date}`)} />

      <div className="grid sm:grid-cols-3 gap-4">
        {stat(tr("Messages tested", "رسائل مختبرة"), n(scams + normal))}
        {stat(tr("Real scam messages", "رسائل احتيال حقيقية"), n(scams))}
        {stat(tr("Normal messages", "رسائل عادية"), n(normal))}
      </div>

      {R.datasets.map((d) => (
        <section key={d.name} className="glass p-6 mt-6">
          <h2 className="text-xl font-semibold">{tr(d.name, d.nameAr)}</h2>
          <p className="text-sm text-muted-foreground mt-1">{tr(d.note, d.noteAr)}</p>
          <div className="mt-5 grid gap-5">
            <Bar tone="primary" label={tr("Scams flagged (orange or red)", "رسائل احتيال تم التحذير منها (برتقالي أو أحمر)")} value={pct(d.flagged, d.scams)}
              sub={tr(`${n(d.flagged)} of ${n(d.scams)} scam messages`, `${n(d.flagged)} من ${n(d.scams)} رسالة احتيال`)} />
            <Bar tone="warning" label={tr("Scams marked “Do not pay” (red)", "رسائل احتيال بعلامة «لا تدفع» (أحمر)")} value={pct(d.doNotPay, d.scams)}
              sub={tr(`${n(d.doNotPay)} of ${n(d.scams)}`, `${n(d.doNotPay)} من ${n(d.scams)}`)} />
            {d.normal > 0 && (
              <Bar tone="danger" label={tr("Normal messages wrongly flagged", "رسائل عادية تم التحذير منها خطأً")} value={pct(d.falseAlarms, d.normal)}
                sub={tr(`${n(d.falseAlarms)} of ${n(d.normal)} normal messages — none marked “Do not pay”`, `${n(d.falseAlarms)} من ${n(d.normal)} رسالة عادية — ولا واحدة بعلامة «لا تدفع»`)} />
            )}
          </div>
          <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-sm text-primary underline">{tr("Dataset source ↗", "مصدر البيانات ↗")}</a>
        </section>
      ))}

      <section className="glass p-6 mt-6 text-sm">
        <h2 className="text-lg font-semibold">{tr("How we tested", "كيف اختبرنا")}</h2>
        <ul className="mt-2 grid gap-1.5 list-disc ps-5 text-muted-foreground">
          <li>{tr("Each dataset was split in half. We improved our rules using one half only, then measured on the other half — messages the rules had never seen.",
            "قسّمنا كل مجموعة بيانات إلى نصفين. حسّنّا القواعد باستخدام نصف واحد فقط، ثم قسنا على النصف الآخر — رسائل لم ترها القواعد من قبل.")}</li>
          <li>{tr(`Overall, ${pct(fa, normal)}% of normal messages were wrongly flagged. We keep false alarms low on purpose: a tool that cries wolf gets ignored.`,
            `إجمالاً، تم التحذير خطأً من ${pct(fa, normal)}% من الرسائل العادية. نبقي الإنذارات الخاطئة منخفضة عمداً: الأداة التي تحذّر من كل شيء يتجاهلها الناس.`)}</li>
          <li>{tr("Both datasets come from outside the UAE. Our rules are tuned for UAE scams (couriers, police fines, banks, Arabic), which these sets barely contain.",
            "كلتا المجموعتين من خارج الإمارات. قواعدنا مضبوطة لأنماط الاحتيال في الإمارات (شركات التوصيل، المخالفات، البنوك، العربية)، وهي نادرة في هذه البيانات.")}</li>
        </ul>
      </section>

      <div className="mt-6 rounded-xl border-s-4 border-warning bg-card p-5 text-sm">
        <div className="font-semibold">{tr("Not tested yet: voice note and image deepfakes", "لم يُختبر بعد: التزييف العميق في الرسائل الصوتية والصور")}</div>
        <p className="text-muted-foreground mt-1">{tr("These numbers cover the message check only. Media detection will be measured the same way once the AI model is connected. Until then the site says “Not checked” instead of guessing.",
          "هذه الأرقام تخص فحص الرسائل فقط. سيُقاس كشف الوسائط بالطريقة نفسها بعد ربط نموذج الذكاء الاصطناعي. حتى ذلك الحين يقول الموقع «لم يُفحص» بدلاً من التخمين.")}</p>
        <p className="text-muted-foreground mt-2">{tr("Next: AI text model on top of the rules to catch the scams these rules miss, and a UAE dataset built with partners during our 90-day pilot.",
          "الخطوة التالية: نموذج ذكاء اصطناعي للنصوص فوق القواعد لالتقاط ما يفوتها، ومجموعة بيانات إماراتية مع الشركاء خلال تجربتنا لمدة 90 يوماً.")}</p>
      </div>
    </div>
  );
}
