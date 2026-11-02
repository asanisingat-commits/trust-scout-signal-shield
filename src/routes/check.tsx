import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { analyzeCombined, type MediaFinding, type MediaKind } from "@/lib/combine";
import { detectMedia } from "@/lib/media.functions";
import { findAiInImageMetadata } from "@/lib/imageMeta";
import type { Result } from "@/lib/detect";
import { ResultCard, PageHead, inputCls, btnCls } from "@/components/ResultCard";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/check")({
  head: () => ({ meta: [
    { title: "Combined Check — Trust Shield" },
    { name: "description", content: "Check a voice note or image together with the message, link, phone number and IBAN that came with it — one answer, before you pay." },
    { property: "og:title", content: "Combined Check — Trust Shield" },
    { property: "og:description", content: "Deepfake + scam check in one tap, in Arabic and English." },
  ] }),
  component: Page,
});

const DEMO = {
  text: "Mum it's me, I had an accident and my phone broke, this is my new number. Please send AED 4,000 now to this account, it's urgent. Don't tell dad.",
  phone: "+44 7700 900123",
  iban: "AE07 0331 2345 6789 0123 456",
};

const MAX_FILE = 10 * 1024 * 1024;

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function Page() {
  const { t, lang } = useLang();
  const tr = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const [kind, setKind] = useState<MediaKind>("voice");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [phone, setPhone] = useState("");
  const [iban, setIban] = useState("");
  const [busy, setBusy] = useState(false);
  const [demo, setDemo] = useState(false);
  const [finding, setFinding] = useState<MediaFinding | null>(null);
  const [r, setR] = useState<Result | null>(null);

  const KINDS: { k: MediaKind; icon: string; label: string }[] = [
    { k: "voice", icon: "🎙️", label: tr("Voice note", "رسالة صوتية") },
    { k: "image", icon: "🖼️", label: tr("Image", "صورة") },
    { k: "video", icon: "🎥", label: tr("Video", "فيديو") },
    { k: "none", icon: "💬", label: tr("Text only", "نص فقط") },
  ];

  const statusText: Record<MediaFinding["status"], string> = {
    likely_fake: tr("Likely AI-generated / manipulated", "على الأرجح مُولَّد أو مُعدَّل بالذكاء الاصطناعي"),
    inconclusive: tr("Inconclusive", "غير حاسم"),
    no_signs: tr("No clear signs found (not proof it is real)", "لم تُكتشف علامات واضحة (ليس دليلاً على أنه حقيقي)"),
    not_checked: tr("Not checked by an AI model", "لم يُفحص بنموذج ذكاء اصطناعي"),
  };

  const run = async (overrides?: Partial<{ text: string; phone: string; iban: string; kind: MediaKind; file: File | null }>) => {
    const k = overrides?.kind ?? kind;
    const f = overrides && "file" in overrides ? overrides.file ?? null : file;
    setBusy(true);
    let media: MediaFinding | undefined;
    try {
      if (f && (k === "voice" || k === "image")) {
        const [metadataAi, b64] = await Promise.all([k === "image" ? findAiInImageMetadata(f) : Promise.resolve(null), toBase64(f)]);
        media = await detectMedia({ data: { kind: k, mime: f.type, b64 } }).catch(() => ({ status: "inconclusive" as const, source: "could not analyse" }));
        media = { ...media, metadataAi };
      } else if (k !== "none") {
        media = { status: "not_checked", source: k === "video" ? tr("Video checks: roadmap", "فحص الفيديو: ضمن خطة التطوير") : tr("No file uploaded", "لم يتم رفع ملف") };
      }
      setFinding(media ?? null);
      setR(analyzeCombined({ text: overrides?.text ?? text, link, phone: overrides?.phone ?? phone, iban: overrides?.iban ?? iban, mediaKind: k, media }, lang));
    } finally {
      setBusy(false);
    }
  };

  const loadDemo = () => {
    setDemo(true); setKind("voice"); setFile(null); setText(DEMO.text); setPhone(DEMO.phone); setIban(DEMO.iban); setLink("");
    void run({ text: DEMO.text, phone: DEMO.phone, iban: DEMO.iban, kind: "voice", file: null });
  };

  const accept = kind === "voice" ? "audio/*,.ogg,.opus,.m4a,.mp3,.wav" : kind === "image" ? "image/*" : undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageHead
        title={t("check")}
        sub={tr("Got a voice note, photo or video asking for money? Add everything you received together. We check the media, the message, the link, the phone number and the bank account, and give you one answer before you pay.",
          "وصلتك رسالة صوتية أو صورة أو فيديو يطلب مالاً؟ أضف كل ما استلمته معاً. نفحص المقطع والرسالة والرابط والرقم والحساب البنكي، ونعطيك جواباً واحداً قبل أن تدفع.")}
        badge={tr("Challenge 40 · LIVE", "التحدي 40 · مباشر")}
      />

      <div className="glass p-5 grid gap-4">
        <div>
          <div className="text-sm font-semibold mb-2">1. {tr("What did you receive?", "ماذا استلمت؟")}</div>
          <div className="flex flex-wrap gap-2">
            {KINDS.map((x) => (
              <button key={x.k} onClick={() => { setKind(x.k); setFile(null); }}
                className={`rounded-full px-4 py-2 text-sm border ${kind === x.k ? "border-primary text-primary bg-primary/10" : ""}`}>{x.icon} {x.label}</button>
            ))}
          </div>
        </div>

        {(kind === "voice" || kind === "image") && (
          <div>
            <div className="text-sm font-semibold mb-2">2. {tr("Upload it (optional, max 10 MB)", "ارفعه (اختياري، الحد 10 ميغابايت)")}</div>
            <input type="file" accept={accept} className={inputCls}
              onChange={(e) => { const f = e.target.files?.[0] ?? null; setFile(f && f.size <= MAX_FILE ? f : null); setDemo(false); }} />
            {file && <p className="text-xs text-muted-foreground mt-1">{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</p>}
          </div>
        )}
        {kind === "video" && (
          <p className="text-sm rounded-lg bg-warning/10 border border-warning/40 text-warning p-3">
            {tr("Video deepfake checks are on our roadmap (designed to plug into SARAAB, the UAE open-source video model, when it is released). For now we check everything that came with the video.",
              "فحص الفيديو المزيّف ضمن خطة التطوير (مصمَّم ليرتبط بنموذج «سراب» الإماراتي مفتوح المصدر عند إطلاقه). حالياً نفحص كل ما وصل مع الفيديو.")}
          </p>
        )}

        <div>
          <div className="text-sm font-semibold mb-2">{kind === "none" ? "2" : "3"}. {tr("The message that came with it", "الرسالة التي وصلت معه")}</div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} maxLength={5000} className={inputCls}
            placeholder={tr("Paste or type what the message said…", "الصق أو اكتب ما قالته الرسالة…")} />
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder={tr("Link (optional)", "رابط (اختياري)")} className={inputCls} dir="ltr" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={tr("Phone number (optional)", "رقم الهاتف (اختياري)")} className={inputCls} dir="ltr" />
          <input value={iban} onChange={(e) => setIban(e.target.value)} placeholder={tr("IBAN (optional)", "الآيبان (اختياري)")} className={inputCls + " font-mono"} dir="ltr" maxLength={40} autoComplete="off" />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button onClick={() => { setDemo(false); void run(); }} disabled={busy || (!text.trim() && !file && !link.trim() && !phone.trim() && !iban.trim())} className={btnCls}>
            {busy ? tr("Checking…", "جارٍ الفحص…") : t("analyze")}
          </button>
          <button onClick={loadDemo} disabled={busy} className="rounded-lg border px-5 py-3 text-sm hover:border-primary">🎬 {tr("Try a demo", "جرّب مثالاً")}</button>
        </div>
        {demo && (
          <p className="text-xs rounded-md bg-muted/60 p-2">
            {tr("Demo — fictional example: a cloned “son” voice note asking his mother for money. No real person or account.",
              "مثال تجريبي — قصة خيالية: رسالة صوتية مستنسخة من «ابن» يطلب المال من أمه. لا يوجد شخص أو حساب حقيقي.")}
          </p>
        )}
        <p className="text-xs text-muted-foreground">🔒 {t("privacyMedia")}</p>
      </div>

      {r && (
        <ResultCard r={r} extra={finding && (
          <div className="mt-4 rounded-lg bg-muted/60 p-3 text-sm">
            <span className="font-semibold">{tr("Media check", "فحص المقطع")}:</span> {statusText[finding.status]}
            {finding.metadataAi && <span> · {tr("metadata names", "البيانات تذكر")} {finding.metadataAi}</span>}
            <div className="text-xs text-muted-foreground mt-1">{tr("Method", "الطريقة")}: {finding.source}</div>
          </div>
        )} />
      )}
    </div>
  );
}
