import { useState } from "react";
import type { Result } from "@/lib/detect";
import { useLang } from "@/lib/i18n";

export function resultToText(r: Result, levelWord: string) {
  return [`Trust Shield: ${levelWord} (${r.score}/10)`, ...r.signals.map((s) => `• ${s.label}`), "", ...r.recommendations].join("\n");
}

export function WhatToDo({ r }: { r: Result }) {
  const { t, lang } = useLang();
  const [showReport, setShowReport] = useState(false);
  const [copied, setCopied] = useState(false);
  const levelWord = t(r.level);

  const share = async () => {
    const text = resultToText(r, levelWord);
    try {
      if (navigator.share) { await navigator.share({ title: "Trust Shield", text }); return; }
    } catch { /* share cancelled or unsupported: fall back to copy */ }
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { /* clipboard blocked */ }
  };
  const speak = () => {
    try {
      const u = new SpeechSynthesisUtterance([`${t("risk")}: ${levelWord}, ${r.score} / 10.`, t("todo1"), t("todo3")].join(" "));
      u.lang = lang === "ar" ? "ar-AE" : "en-US";
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    } catch { /* speech not supported */ }
  };

  return (
    <div className="mt-6 rounded-xl border border-primary/40 bg-secondary p-5">
      <h3 className="font-semibold text-lg">{t("todoTitle")}</h3>
      <ol className="mt-3 grid gap-2 text-sm list-decimal ps-5">
        <li>{t("todo1")}</li><li>{t("todo2")}</li><li>{t("todo3")}</li><li>{t("todo4")}</li>
      </ol>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => setShowReport(!showReport)} className="rounded-lg bg-uae-red text-white font-semibold px-4 py-2 text-sm hover:brightness-110">{t("report")}</button>
        <button onClick={share} className="rounded-lg border px-4 py-2 text-sm hover:border-primary">{copied ? t("shared") : t("share")}</button>
        <button onClick={speak} className="rounded-lg border px-4 py-2 text-sm hover:border-primary">{t("readAloud")}</button>
      </div>
      {showReport && (
        <div className="mt-4 rounded-lg bg-muted/60 p-4 text-sm">
          <div className="font-semibold">{t("reportTitle")}</div>
          <ul className="mt-2 grid gap-1 list-disc ps-5">
            <li>{t("rep1")}</li><li>{t("rep2")}</li><li>{t("rep3")}</li><li>{t("rep4")}</li><li>{t("rep5")}</li>
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">{t("reportNote")}</p>
        </div>
      )}
    </div>
  );
}
