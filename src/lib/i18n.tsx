import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Lang = "en" | "ar";
const dict = {
  en: {
    home: "Home", url: "URL Scanner", message: "Message Scanner", phone: "Phone Checker", bank: "Bank / IBAN", media: "Media Verify", learn: "Stay Safe",
    tagline: "Detect. Verify. Protect.", heroTitle: "Stop Scams. Verify the Truth. Stay Protected.",
    heroSub: "Trust Shield analyses links, messages, phone numbers and bank details for scam warning signs — transparently, with every signal explained.",
    startScan: "Scan a message", scanUrl: "Check a link", analyze: "Analyze", samples: "Try a demo sample", privacy: "Processed in your browser. Nothing is stored.",
    risk: "Risk score", low: "Low risk", medium: "Medium risk", high: "High risk", confidence: "Evidence strength", signals: "Warning signs found",
    noSignals: "No warning signs detected by our rules.", recs: "Safety recommendations", inconclusive: "Inconclusive — not enough evidence to call this safe. Stay cautious.",
    comingSoon: "Coming soon",
    check: "Combined Check", results: "How well it works", checkAll: "Check everything at once",
    privacyMedia: "Text checks run in your browser. Media files are sent securely to an AI detection model only for analysis and are not stored. We do not store your files or messages.",
    todoTitle: "What to do now", todo1: "Call the person back on the number you already have saved, not the number in the message.",
    todo2: "Ask a family safe word or a question only the real person knows.", todo3: "Don’t send money or share codes until you have verified.",
    todo4: "Already paid? Call your bank immediately and ask them to stop the transfer.",
    report: "Report", copy: "Copy result", copied: "Copied", readAloud: "Read result aloud",
    reportTitle: "Where to report in the UAE", reportNote: "Check each official site for the latest reporting channel.",
    rep1: "Emergency: Police 999", rep2: "Dubai Police e-Crime platform: ecrime.ae", rep3: "Abu Dhabi Police Aman service: 800 2626",
    navCheck: "Check", accuracy: "How accurate?", share: "Share result with family", shared: "Copied — paste it to your family",
    rep4: "Your bank’s official fraud line (number on the back of your card)", rep5: "Report the sender inside WhatsApp / the app you received it on",
  },
  ar: {
    home: "الرئيسية", url: "فحص الروابط", message: "فحص الرسائل", phone: "فحص الأرقام", bank: "الحساب البنكي", media: "التحقق من الوسائط", learn: "ابقَ آمناً",
    tagline: "اكشف. تحقّق. احمِ.", heroTitle: "أوقف الاحتيال. تحقّق من الحقيقة. ابقَ محمياً.",
    heroSub: "يحلل درع الثقة الروابط والرسائل وأرقام الهواتف والحسابات البنكية بحثاً عن علامات الاحتيال، مع شرح واضح لكل علامة.",
    startScan: "افحص رسالة", scanUrl: "افحص رابطاً", analyze: "تحليل", samples: "جرّب مثالاً تجريبياً", privacy: "تتم المعالجة في متصفحك. لا يتم حفظ أي شيء.",
    risk: "درجة الخطر", low: "خطر منخفض", medium: "خطر متوسط", high: "خطر مرتفع", confidence: "قوة الأدلة", signals: "علامات التحذير",
    noSignals: "لم تُكتشف علامات تحذير وفق قواعدنا.", recs: "توصيات السلامة", inconclusive: "غير حاسم — لا توجد أدلة كافية للحكم بالأمان. كن حذراً.",
    comingSoon: "قريباً",
    check: "الفحص الشامل", results: "مدى فعالية الأداة", checkAll: "افحص كل شيء مرة واحدة",
    privacyMedia: "يتم فحص النصوص في متصفحك. تُرسل ملفات الصوت والصور بأمان إلى نموذج كشف بالذكاء الاصطناعي للتحليل فقط ولا يتم حفظها. لا نحفظ ملفاتك أو رسائلك.",
    todoTitle: "ماذا تفعل الآن", todo1: "اتصل بالشخص على الرقم المحفوظ لديك مسبقاً، وليس الرقم الموجود في الرسالة.",
    todo2: "اسأل عن كلمة سر عائلية أو سؤال لا يعرف جوابه إلا الشخص الحقيقي.", todo3: "لا ترسل مالاً ولا تشارك أي رموز قبل أن تتحقق.",
    todo4: "هل دفعت بالفعل؟ اتصل ببنكك فوراً واطلب إيقاف التحويل.",
    report: "إبلاغ", copy: "نسخ النتيجة", copied: "تم النسخ", readAloud: "اقرأ النتيجة بصوت عالٍ",
    reportTitle: "أين تُبلّغ في الإمارات", reportNote: "تحقق من الموقع الرسمي لكل جهة لمعرفة أحدث قناة للإبلاغ.",
    rep1: "الطوارئ: الشرطة 999", rep2: "منصة الجرائم الإلكترونية لشرطة دبي: ecrime.ae", rep3: "خدمة أمان لشرطة أبوظبي: 800 2626",
    navCheck: "افحص", accuracy: "ما مدى الدقة؟", share: "شارك النتيجة مع العائلة", shared: "تم النسخ — الصقه لعائلتك",
    rep4: "خط الاحتيال الرسمي لبنكك (الرقم على ظهر بطاقتك)", rep5: "أبلغ عن المرسل داخل واتساب أو التطبيق الذي وصلتك عليه الرسالة",
  },
};
export type Key = keyof typeof dict.en;
const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({ lang: "en", setLang: () => {}, t: (k) => dict.en[k] });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => { const s = localStorage.getItem("ts-lang"); if (s === "ar") setLang("ar"); }, []);
  useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"; localStorage.setItem("ts-lang", lang); }, [lang]);
  return <Ctx.Provider value={{ lang, setLang, t: (k) => dict[lang][k] }}>{children}</Ctx.Provider>;
}
export const useLang = () => useContext(Ctx);
