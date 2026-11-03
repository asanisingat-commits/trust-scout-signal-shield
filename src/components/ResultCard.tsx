import type { Result } from "@/lib/detect";
import { useLang } from "@/lib/i18n";
import { WhatToDo } from "@/components/WhatToDo";

export function scoreColor(score: number) {
  // 0 green -> 10 red, continuous hue
  const hue = 150 - score * 12.5;
  return `oklch(var(--score-l) 0.17 ${hue})`;
}

export function ResultCard({ r, extra }: { r: Result; extra?: React.ReactNode }) {
  const { t, lang } = useLang();
  const c = scoreColor(r.score);
  const conf = lang === "ar" ? ({ low: "ضعيفة", moderate: "متوسطة", strong: "قوية" } as const)[r.confidence] : r.confidence;
  return (
    <div className="glass p-6 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-wrap items-center gap-6">
        <div className="relative size-28 rounded-full grid place-items-center" style={{ background: `conic-gradient(${c} ${r.score * 36}deg, var(--muted) 0)` }}>
          <div className="size-22 rounded-full bg-card grid place-items-center">
            <div className="text-center"><div className="text-3xl font-bold font-display" style={{ color: c }}>{r.score}</div><div className="text-xs text-muted-foreground">/ 10</div></div>
          </div>
        </div>
        <div className="flex-1 min-w-48">
          <div className="text-sm text-muted-foreground">{t("risk")}</div>
          <div className="text-2xl font-bold font-display" style={{ color: c }}>{t(r.level)}</div>
          <div className="mt-2 text-sm">{t("confidence")}: <span className="font-semibold capitalize">{conf}</span>
            <div className="flex gap-1 mt-1">{[0, 1, 2].map((i) => <div key={i} className={`h-1.5 w-10 rounded ${i <= ["low", "moderate", "strong"].indexOf(r.confidence) ? "bg-primary" : "bg-muted"}`} />)}</div>
          </div>
        </div>
        {/* score legend */}
        <div className="flex gap-0.5">{Array.from({ length: 11 }, (_, i) => <div key={i} title={String(i)} className={`w-3 h-6 rounded-sm ${i === Math.round(r.score) ? "ring-2 ring-foreground" : ""}`} style={{ background: scoreColor(i) }} />)}</div>
      </div>
      {extra}
      {r.inconclusive && <div className="mt-4 rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm text-warning">⚠ {t("inconclusive")}</div>}
      <h3 className="mt-6 font-semibold">{t("signals")}</h3>
      {r.signals.length === 0 ? <p className="text-sm text-muted-foreground mt-2">{t("noSignals")}</p> : (
        <ul className="mt-2 grid gap-2">
          {r.signals.map((s, i) => (
            <li key={i} className="rounded-lg bg-muted/60 p-3 flex gap-3">
              <span className="text-xs font-mono rounded px-1.5 py-0.5 h-fit" style={{ background: scoreColor(Math.min(10, s.weight * 2.5)), color: "var(--primary-foreground)" }}>+{s.weight}</span>
              <div><div className="font-medium text-sm">{s.label}</div><div className="text-xs text-muted-foreground">{s.detail}</div></div>
            </li>
          ))}
        </ul>
      )}
      <h3 className="mt-6 font-semibold">{t("recs")}</h3>
      <ul className="mt-2 grid gap-1 text-sm list-disc ps-5">{r.recommendations.map((x) => <li key={x}>{x}</li>)}</ul>
      <WhatToDo r={r} />
      {r.notes.map((n) => <p key={n} className="mt-4 text-xs text-muted-foreground border-t pt-3">ℹ {n}</p>)}
    </div>
  );
}

export function PageHead({ title, sub, badge }: { title: string; sub: string; badge?: string }) {
  return (
    <div className="mb-6">
      {badge && <span className="text-xs rounded-full bg-primary/15 text-primary px-2 py-1">{badge}</span>}
      <h1 className="text-3xl md:text-4xl font-bold mt-2">{title}</h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">{sub}</p>
    </div>
  );
}

export function Samples({ items, onPick }: { items: { label: string; value: string }[]; onPick: (v: string) => void }) {
  const { t } = useLang();
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
      <span className="text-muted-foreground">{t("samples")}:</span>
      {items.map((s) => <button key={s.label} onClick={() => onPick(s.value)} className="rounded-full border px-3 py-1 hover:border-primary hover:text-primary">{s.label}</button>)}
    </div>
  );
}

export const inputCls = "w-full rounded-lg border bg-input/30 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";
export const btnCls = "rounded-lg bg-primary text-primary-foreground font-semibold px-6 py-3 glow hover:brightness-110 transition disabled:opacity-50";
