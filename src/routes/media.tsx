import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead } from "@/components/ResultCard";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/media")({
  head: () => ({ meta: [
    { title: "Media Verify — Trust Shield" }, { name: "description", content: "Voice note and image deepfake checks, combined with the message that came with them." },
    { property: "og:title", content: "Media Verify — Trust Shield" }, { property: "og:description", content: "Check voice notes and images for signs of AI manipulation." },
  ] }),
  component: Page,
});

function Page() {
  const { t, lang } = useLang();
  const tr = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const items = [
    ["🎙️", tr("Voice notes", "الرسائل الصوتية"), tr("An AI detection model looks for signs of voice cloning.", "يبحث نموذج كشف بالذكاء الاصطناعي عن علامات استنساخ الصوت."), true],
    ["🖼️", tr("Images", "الصور"), tr("AI detection plus the image's own metadata (e.g. tags left by AI generators).", "كشف بالذكاء الاصطناعي إضافة إلى بيانات الصورة نفسها (مثل وسوم أدوات التوليد)."), true],
    ["🎬", tr("Video", "الفيديو"), tr("Roadmap: designed to plug into SARAAB, the UAE's open-source deepfake video model.", "ضمن خطة التطوير: مصمَّم ليرتبط بنموذج «سراب» الإماراتي مفتوح المصدر لكشف الفيديو المزيّف."), false],
  ] as const;
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHead title={t("media")} sub={tr("Deepfakes are most dangerous when they come with a money request. Check the media and everything that came with it in the Combined Check.",
        "التزييف العميق أخطر ما يكون عندما يأتي مع طلب مال. افحص المقطع وكل ما وصل معه في الفحص الشامل.")} badge="LIVE" />
      <div className="grid md:grid-cols-3 gap-4">
        {items.map(([i, h, d, live]) => (
          <div key={h} className="glass p-6"><div className="text-3xl">{i}</div><h3 className="mt-3 font-semibold">{h}</h3><p className="text-sm text-muted-foreground mt-1">{d}</p>
            <span className={`mt-4 inline-block text-[10px] rounded-full px-2 py-0.5 ${live ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning"}`}>{live ? "LIVE" : t("comingSoon")}</span></div>
        ))}
      </div>
      <Link to="/check" className="mt-6 inline-block rounded-lg bg-primary text-primary-foreground font-semibold px-6 py-3 glow hover:brightness-110">{t("checkAll")}</Link>
      <div className="mt-8 rounded-xl border-s-4 border-uae-red bg-card/50 p-5 text-sm">
        <div className="font-semibold">{tr("During emergencies", "أثناء الطوارئ")}</div>
        <p className="text-muted-foreground mt-1">{tr("Rely only on official channels: WAM news agency, NCEMA, and police accounts. Do not forward unverified videos or alerts — spreading rumours is an offence under UAE law.",
          "اعتمد فقط على القنوات الرسمية: وكالة وام، والهيئة الوطنية لإدارة الطوارئ والأزمات والكوارث، وحسابات الشرطة. لا تعِد إرسال مقاطع أو تنبيهات غير موثقة، فنشر الشائعات مخالفة يعاقب عليها القانون الإماراتي.")}</p>
      </div>
    </div>
  );
}
