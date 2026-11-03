import { Link } from "@tanstack/react-router";
import type { Result } from "@/lib/detect";
import type { Part, PartStatus } from "@/lib/combine";
import { useLang } from "@/lib/i18n";
import { WhatToDo } from "@/components/WhatToDo";
import { scoreColor } from "@/components/ResultCard";

const CHIP: Record<PartStatus, string> = {
  high: "bg-destructive/15 text-destructive",
  medium: "bg-warning/15 text-warning",
  unsure: "bg-warning/15 text-warning",
  no_signs: "bg-primary/15 text-primary",
  not_checked: "bg-muted text-muted-foreground",
};

export function CheckResult({ r, parts, onReset }: { r: Result; parts: Part[]; onReset: () => void }) {
  const { t, lang } = useLang();
  const tr = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const c = scoreColor(r.score);

  const verdict = r.level === "high" ? tr("Do not pay", "لا تدفع")
    : r.level === "medium" ? tr("Be careful — verify first", "انتبه — تحقّق أولاً")
    : r.inconclusive ? tr("Not sure — still verify", "غير متأكد — تحقّق مع ذلك")
    : tr("No clear warning signs", "لا توجد علامات تحذير واضحة");
  const flagged = parts.filter((p) => p.status === "high" || p.status === "medium").length;
  const sub = r.level === "high" ? tr(`This looks like a scam. ${flagged} of the ${parts.length} things you sent have warning signs.`, `يبدو هذا احتيالاً. ${flagged} من ${parts.length} أشياء أرسلتها فيها علامات تحذير.`)
    : r.level === "medium" ? tr(`${flagged} of the ${parts.length} things you sent have warning signs. Check with the person or company before you do anything.`, `${flagged} من ${parts.length} أشياء أرسلتها فيها علامات تحذير. تحقّق مع الشخص أو الجهة قبل أي خطوة.`)
    : tr("We found nothing strong, but that is not proof it is genuine.", "لم نجد شيئاً قوياً، لكن هذا ليس دليلاً على أنه حقيقي.");
  const conf = { low: tr("weak — only a little evidence", "ضعيفة — أدلة قليلة"), moderate: tr("moderate", "متوسطة"), strong: tr("strong — several separate signals agree", "قوية — عدة علامات مستقلة تتفق") }[r.confidence];
  const statusLabel: Record<PartStatus, string> = {
    high: tr("High risk", "خطر مرتفع"), medium: tr("Warning", "تحذير"), unsure: tr("Can't confirm", "لا يمكن التأكيد"),
    no_signs: tr("No signs found", "لا علامات"), not_checked: tr("Not checked", "لم يُفحص"),
  };

  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onReset} className="w-fit text-sm text-primary hover:underline">{lang === "ar" ? "→" : "←"} {tr("Check something else", "افحص شيئاً آخر")}</button>

      <section className="rounded-2xl border-2 p-6 flex flex-wrap items-center gap-6" style={{ borderColor: c, background: `color-mix(in oklab, ${c} 10%, var(--card))` }} aria-live="polite">
        <div className="size-28 shrink-0 rounded-full grid place-items-center border-8" style={{ borderColor: c }}>
          <div className="text-center"><div className="text-3xl font-bold font-display" style={{ color: c }}>{r.score}</div><div className="text-xs text-muted-foreground">{tr("out of 10", "من 10")}</div></div>
        </div>
        <div className="flex-1 min-w-60">
          <h2 className="text-3xl font-bold" style={{ color: c }}>{verdict}</h2>
          <p className="mt-1 text-lg">{sub}</p>
          <p className="mt-2 text-sm text-muted-foreground">{tr("How sure we are", "مدى تأكدنا")}: {conf}</p>
        </div>
      </section>

      <WhatToDo r={r} />

      <section>
        <h2 className="text-xl font-bold mb-3">{tr("What we checked", "ما الذي فحصناه")}</h2>
        <div className="grid gap-2">
          {parts.map((p, i) => (
            <details key={p.key} open={i === 0} className="glass px-5 py-4">
              <summary className="flex items-center gap-3 cursor-pointer min-h-8">
                <span className="font-semibold flex-1 break-all">{p.title}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${CHIP[p.status]}`}>{statusLabel[p.status]}</span>
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{p.detail}</p>
            </details>
          ))}
        </div>
      </section>

      {r.signals.length > 0 && (
        <details className="glass px-5 py-4">
          <summary className="cursor-pointer font-semibold">{tr(`Every warning sign we found (${r.signals.length})`, `كل علامات التحذير التي وجدناها (${r.signals.length})`)}</summary>
          <ul className="mt-3 grid gap-2">
            {r.signals.map((s, i) => (
              <li key={i} className="rounded-lg bg-muted/60 p-3 flex gap-3">
                <span className="text-xs font-mono rounded px-1.5 py-0.5 h-fit" style={{ background: scoreColor(Math.min(10, s.weight * 2.5)), color: "var(--primary-foreground)" }}>+{s.weight}</span>
                <div><div className="font-medium text-sm">{s.label}</div><div className="text-xs text-muted-foreground">{s.detail}</div></div>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="text-xs text-muted-foreground grid gap-1">
        {r.notes.map((n) => <p key={n}>ℹ {n}</p>)}
        <p>{tr("Trust Shield gives a risk estimate, not a guarantee.", "يقدم درع الثقة تقديراً للخطر وليس ضماناً.")} <Link to="/results" className="text-primary underline">{t("accuracy")}</Link></p>
      </div>
    </div>
  );
}
