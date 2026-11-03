import { useLang } from "@/lib/i18n";

// Official UAE reporting channels, as listed on the UAE government portal
// (u.ae › Cyber safety and digital security › Reporting cybercrimes online).
// Text only, no logos: Trust Shield is not a government service.
type Channel = { name: [string, string]; who: [string, string]; how: [string, string]; href?: string; tel?: string };

const CHANNELS: Channel[] = [
  { name: ["eCrime platform", "منصة الجرائم الإلكترونية"], who: ["Ministry of Interior · all emirates", "وزارة الداخلية · جميع الإمارات"],
    how: ["In the MOI UAE app (sign in with UAE Pass)", "عبر تطبيق وزارة الداخلية (الدخول بالهوية الرقمية)"], href: "https://moi.gov.ae" },
  { name: ["eCrime", "إي كرايم"], who: ["Dubai Police", "شرطة دبي"], how: ["ecrime.ae", "ecrime.ae"], href: "https://www.ecrime.ae" },
  { name: ["Aman service", "خدمة أمان"], who: ["Abu Dhabi Police", "شرطة أبوظبي"], how: ["Call 800 2626 or report online", "اتصل على 800 2626 أو أبلغ إلكترونياً"], href: "https://aman.adpolice.gov.ae", tel: "8002626" },
  { name: ["Najeed", "نجيد"], who: ["Sharjah Police", "شرطة الشارقة"], how: ["Call 800 151 or SMS 7999", "اتصل على 800151 أو أرسل رسالة إلى 7999"], tel: "800151" },
  { name: ["My Safe Society app", "تطبيق مجتمعي آمن"], who: ["Federal Public Prosecution", "النيابة العامة الاتحادية"], how: ["Attach screenshots, audio or links", "أرفق لقطات الشاشة أو التسجيلات أو الروابط"] },
];

export function ReportSection() {
  const { lang } = useLang();
  const tr = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const pick = (x: [string, string]) => (lang === "ar" ? x[1] : x[0]);

  return (
    <section className="mt-12" aria-labelledby="report-h">
      <h2 id="report-h" className="text-2xl font-bold">{tr("Report it to the authorities", "أبلغ الجهات الرسمية")}</h2>
      <p className="mt-1 text-muted-foreground">{tr("Reporting takes a few minutes and helps police stop the same scam reaching others.", "الإبلاغ يستغرق دقائق ويساعد الشرطة على إيقاف الاحتيال قبل أن يصل لغيرك.")}</p>

      <div className="mt-5 rounded-xl border-2 border-destructive/60 bg-destructive/10 p-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-56">
          <div className="font-semibold">{tr("Already sent money?", "هل حوّلت المال بالفعل؟")}</div>
          <p className="text-sm text-muted-foreground mt-0.5">{tr("Call your bank first — the number on the back of your card — and ask them to stop the transfer. Then report it below.", "اتصل ببنكك أولاً على الرقم الموجود خلف بطاقتك واطلب إيقاف التحويل، ثم أبلغ عبر إحدى القنوات أدناه.")}</p>
        </div>
        <a href="tel:999" className="rounded-lg bg-uae-red text-white font-semibold px-5 py-3 hover:brightness-110">{tr("Emergency: 999", "الطوارئ: 999")}</a>
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {CHANNELS.map((c) => (
          <li key={c.name[0]} className="glass p-4 flex flex-col gap-1">
            <div className="text-xs text-muted-foreground">{pick(c.who)}</div>
            <div className="font-semibold">{pick(c.name)}</div>
            <div className="text-sm">{pick(c.how)}</div>
            {(c.href || c.tel) && (
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                {c.tel && <a href={`tel:${c.tel}`} className="rounded-md border px-3 py-1.5 hover:border-primary">{tr("Call", "اتصال")}</a>}
                {c.href && <a href={c.href} target="_blank" rel="noopener noreferrer" className="rounded-md border px-3 py-1.5 hover:border-primary">{tr("Open official site ↗", "الموقع الرسمي ↗")}</a>}
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-xl bg-card/50 border p-4 text-sm">
        <div className="font-semibold">{tr("Have this ready when you report", "جهّز هذه المعلومات عند الإبلاغ")}</div>
        <ul className="mt-2 grid gap-1 list-disc ps-5 text-muted-foreground">
          <li>{tr("Screenshots of the messages, and the voice note or image", "لقطات شاشة للرسائل، والرسالة الصوتية أو الصورة")}</li>
          <li>{tr("The sender’s number, the link, and the IBAN they gave you", "رقم المرسل والرابط ورقم الآيبان الذي أرسله")}</li>
          <li>{tr("If you paid: the amount, time and bank receipt", "إن دفعت: المبلغ والوقت وإيصال البنك")}</li>
        </ul>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {tr("Channels as listed on the UAE government portal u.ae. Trust Shield is an independent tool and is not part of any government service.", "القنوات كما وردت في البوابة الرسمية لحكومة الإمارات u.ae. درع الثقة أداة مستقلة وليست جزءاً من أي خدمة حكومية.")}
      </p>
    </section>
  );
}
