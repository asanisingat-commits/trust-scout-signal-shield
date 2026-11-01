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
  },
  ar: {
    home: "الرئيسية", url: "فحص الروابط", message: "فحص الرسائل", phone: "فحص الأرقام", bank: "الحساب البنكي", media: "التحقق من الوسائط", learn: "ابقَ آمناً",
    tagline: "اكشف. تحقّق. احمِ.", heroTitle: "أوقف الاحتيال. تحقّق من الحقيقة. ابقَ محمياً.",
    heroSub: "يحلل درع الثقة الروابط والرسائل وأرقام الهواتف والحسابات البنكية بحثاً عن علامات الاحتيال، مع شرح واضح لكل علامة.",
    startScan: "افحص رسالة", scanUrl: "افحص رابطاً", analyze: "تحليل", samples: "جرّب مثالاً تجريبياً", privacy: "تتم المعالجة في متصفحك. لا يتم حفظ أي شيء.",
    risk: "درجة الخطر", low: "خطر منخفض", medium: "خطر متوسط", high: "خطر مرتفع", confidence: "قوة الأدلة", signals: "علامات التحذير",
    noSignals: "لم تُكتشف علامات تحذير وفق قواعدنا.", recs: "توصيات السلامة", inconclusive: "غير حاسم — لا توجد أدلة كافية للحكم بالأمان. كن حذراً.",
    comingSoon: "قريباً",
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
