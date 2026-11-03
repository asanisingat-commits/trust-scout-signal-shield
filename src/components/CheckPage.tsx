import { useMemo, useState } from "react";
import { analyzeCombined, checkParts, type CombinedInput, type MediaFinding, type MediaKind } from "@/lib/combine";
import { extractParts, shortIban } from "@/lib/extract";
import { detectMedia } from "@/lib/media.functions";
import { findAiInImageMetadata } from "@/lib/imageMeta";
import { CheckResult } from "@/components/CheckResult";
import { ReportSection } from "@/components/ReportSection";
import { useLang } from "@/lib/i18n";

const MAX_FILE = 10 * 1024 * 1024;

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

type Example = { label: [string, string]; text: string; kind: MediaKind; note?: [string, string] };
const EXAMPLES: Example[] = [
  { label: ["Fake parcel fee", "رسوم طرد وهمية"], kind: "none",
    text: "Aramex: Your parcel is held at our facility due to an unpaid customs fee of AED 12.50. Pay within 24 hours or it will be returned: https://aramex-uae-pay.xyz/track" },
  { label: ["“Son” voice note", "رسالة صوتية من «الابن»"], kind: "voice",
    text: "Mum it's me, I had an accident and my phone broke, this is my new number +44 7700 900123. Please send AED 4,000 now to AE07 0331 2345 6789 0123 456, it's urgent. Don't tell dad.",
    note: ["Fictional example: a cloned “son” voice note asking his mother for money. No real person or account.", "مثال خيالي: رسالة صوتية مستنسخة من «ابن» يطلب المال من أمه. لا يوجد شخص أو حساب حقيقي."] },
  { label: ["Normal bank SMS", "رسالة بنك عادية"], kind: "none",
    text: "Your card ending 4421 was used for AED 85.00 at a supermarket on 03/11. If this wasn't you, call the number on the back of your card." },
];

function Icon({ d }: { d: string }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-primary shrink-0"><path d={d} /></svg>;
}
const MIC = "M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM5 11a7 7 0 0 0 14 0M12 18v3";
const IMG = "M3 5h18v14H3zM21 15l-5-5-11 11M9 10a1.5 1.5 0 1 0 0-.01";
const LOCK = "M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4";

export function CheckPage() {
  const { lang } = useLang();
  const tr = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileKind, setFileKind] = useState<MediaKind>("none");
  const [tooBig, setTooBig] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<[string, string] | null>(null);
  const [input, setInput] = useState<CombinedInput | null>(null);
  // Recomputed on language change so the whole result switches language.
  const out = useMemo(() => (input ? { r: analyzeCombined(input, lang), parts: checkParts(input, lang) } : null), [input, lang]);

  const found = useMemo(() => extractParts(text), [text]);

  const pick = (kind: MediaKind) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (f && f.size > MAX_FILE) { setTooBig(true); return; }
    setTooBig(false); setFile(f); setFileKind(f ? kind : "none"); setNote(null);
  };

  const run = async (t = text, kind: MediaKind = file ? fileKind : "none", f: File | null = file) => {
    setBusy(true);
    try {
      const x = extractParts(t);
      let media: MediaFinding | undefined;
      if (f && (kind === "voice" || kind === "image")) {
        const [metadataAi, b64] = await Promise.all([kind === "image" ? findAiInImageMetadata(f) : Promise.resolve(null), toBase64(f)]);
        media = await detectMedia({ data: { kind, mime: f.type, b64 } }).catch(() => ({ status: "inconclusive" as const, source: "could not analyse" }));
        media = { ...media, metadataAi };
      } else if (kind !== "none") {
        media = { status: "not_checked", source: tr("No file uploaded", "لم يتم رفع ملف") };
      }
      setInput({ text: t, link: x.links[0] ?? "", phone: x.phones[0] ?? "", iban: x.ibans[0] ?? "", mediaKind: kind, media });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setBusy(false);
    }
  };

  const tryExample = (ex: Example) => {
    setText(ex.text); setFile(null); setFileKind("none"); setNote(ex.note ?? null);
    void run(ex.text, ex.kind, null);
  };

  if (out) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        {note && <p className="mb-4 text-xs rounded-md bg-muted/60 p-2">{tr(note[0], note[1])}</p>}
        <CheckResult r={out.r} parts={out.parts} onReset={() => { setInput(null); setText(""); setFile(null); setFileKind("none"); setNote(null); }} />
      </div>
    );
  }

  const chips = [
    ...found.links.map((l) => `${tr("Link", "رابط")} · ${l.replace(/^https?:\/\//, "").slice(0, 32)}`),
    ...found.ibans.map((i) => `IBAN · ${shortIban(i)}`),
    ...found.phones.map((p) => `${tr("Phone", "هاتف")} · ${p}`),
  ];
  const canRun = !busy && (text.trim().length > 0 || !!file);
  const fileBtn = "min-h-14 rounded-xl border border-input bg-card px-4 flex items-center justify-center gap-3 cursor-pointer hover:border-primary focus-within:ring-2 focus-within:ring-ring/40";

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 pb-10">
      <h1 className="text-center text-4xl md:text-5xl font-medium">{tr("Check before you pay", "تحقّق قبل أن تدفع")}</h1>
      <p className="mt-4 text-center text-muted-foreground text-lg max-w-2xl mx-auto">
        {tr("Paste the message, link, phone number or IBAN. Add the voice note or image if there is one. You get one answer.",
          "الصق الرسالة أو الرابط أو الرقم أو الآيبان. أضف الرسالة الصوتية أو الصورة إن وُجدت. تحصل على جواب واحد.")}
      </p>

      <section className="glass mt-8 p-5 md:p-6 grid gap-4" aria-label={tr("Check", "افحص")}>
        <label htmlFor="ts-msg" className="font-semibold">{tr("What did you receive?", "ماذا استلمت؟")}</label>
        <textarea id="ts-msg" value={text} onChange={(e) => { setText(e.target.value); setNote(null); }} rows={5} maxLength={5000}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
          placeholder={tr("Paste the whole message here — links, numbers and IBANs inside it are found automatically", "الصق الرسالة كاملة هنا — نجد الروابط والأرقام والآيبان بداخلها تلقائياً")} />

        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">{tr("Found in your text:", "وجدنا في النص:")}</span>
            {chips.map((c) => <span key={c} className="rounded-full bg-muted px-3 py-1" dir="ltr">{c}</span>)}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className={`${fileBtn} ${fileKind === "voice" ? "border-primary bg-primary/10" : ""}`}>
            <input type="file" accept="audio/*,.ogg,.opus,.m4a,.mp3,.wav" className="sr-only" onChange={pick("voice")} />
            <Icon d={MIC} /><span>{fileKind === "voice" && file ? file.name.slice(0, 22) : tr("Add voice note", "أضف رسالة صوتية")}</span>
          </label>
          <label className={`${fileBtn} ${fileKind === "image" ? "border-primary bg-primary/10" : ""}`}>
            <input type="file" accept="image/*" className="sr-only" onChange={pick("image")} />
            <Icon d={IMG} /><span>{fileKind === "image" && file ? file.name.slice(0, 22) : tr("Add image", "أضف صورة")}</span>
          </label>
        </div>
        {file && <button onClick={() => { setFile(null); setFileKind("none"); }} className="w-fit text-xs text-muted-foreground underline">{tr("Remove file", "إزالة الملف")}</button>}
        {tooBig && <p className="text-sm text-warning">{tr("That file is over 10 MB. Try a shorter clip or a screenshot.", "الملف أكبر من 10 ميغابايت. جرّب مقطعاً أقصر أو لقطة شاشة.")}</p>}

        <button onClick={() => void run()} disabled={!canRun}
          className="h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:brightness-110 transition disabled:opacity-50">
          {busy ? tr("Checking…", "جارٍ الفحص…") : tr("Check it", "افحص")}
        </button>

        <p className="text-sm text-muted-foreground flex items-start gap-2"><Icon d={LOCK} />
          {tr("Text is checked in your browser. Media is sent to the AI model only for the check and is not stored.", "يُفحص النص في متصفحك. تُرسل الوسائط إلى نموذج الذكاء الاصطناعي للفحص فقط ولا تُحفظ.")}</p>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">{tr("Try an example:", "جرّب مثالاً:")}</span>
          {EXAMPLES.map((ex) => (
            <button key={ex.label[0]} onClick={() => tryExample(ex)} disabled={busy} className="rounded-full border px-3 py-1.5 hover:border-primary hover:text-primary">{tr(ex.label[0], ex.label[1])}</button>
          ))}
        </div>
      </section>

      <ReportSection />
      <p className="mt-10 text-center text-sm text-muted-foreground">
        {tr("Works alongside SARAAB and TDRA Digital FraudHunter — built for residents, at the moment before they pay.", "يعمل جنباً إلى جنب مع «سراب» و«صائد الاحتيال الرقمي» من هيئة تنظيم الاتصالات — مصمَّم للمقيمين، في اللحظة التي تسبق الدفع.")}
      </p>
    </div>
  );
}
