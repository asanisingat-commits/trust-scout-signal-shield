import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";

type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** Registers the service worker and offers "Install app" (Android / desktop) or Add-to-Home-Screen steps (iPhone). */
export function InstallApp() {
  const { lang } = useLang();
  const tr = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const [prompt, setPrompt] = useState<PromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia?.("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
    setInstalled(!!standalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    // Skip inside editor/preview iframes so the preview never gets a stale cache.
    if ("serviceWorker" in navigator && window.self === window.top) navigator.serviceWorker.register("/sw.js").catch(() => {});
    const onPrompt = (e: Event) => { e.preventDefault(); setPrompt(e as PromptEvent); };
    const onInstalled = () => { setInstalled(true); setPrompt(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  if (installed) return null;

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const choice = await prompt.userChoice.catch(() => null);
    if (choice?.outcome === "accepted") setInstalled(true);
    setPrompt(null);
  };

  return (
    <section className="glass mt-8 p-5 flex flex-wrap items-center gap-4" aria-labelledby="app-h">
      <img src="/icon-192.png" alt="" width={56} height={56} className="rounded-2xl" />
      <div className="flex-1 min-w-56">
        <h2 id="app-h" className="text-lg font-semibold">{tr("Get the Trust Shield app", "حمّل تطبيق درع الثقة")}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {ios
            ? tr("On iPhone: tap the Share button in Safari, then “Add to Home Screen”.", "على الآيفون: اضغط زر المشاركة في سفاري، ثم «إضافة إلى الشاشة الرئيسية».")
            : tr("Free, no sign-up. On Android, share a suspicious WhatsApp or SMS straight to Trust Shield to check it.",
              "مجاني وبدون تسجيل. على أندرويد، شارك أي رسالة واتساب أو SMS مشبوهة مباشرة إلى درع الثقة لفحصها.")}
        </p>
      </div>
      {prompt && (
        <button onClick={install} className="h-12 rounded-xl bg-primary text-primary-foreground font-semibold px-5 hover:brightness-110">
          {tr("Install app", "تثبيت التطبيق")}
        </button>
      )}
    </section>
  );
}
