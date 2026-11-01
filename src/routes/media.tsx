import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/ResultCard";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/media")({
  head: () => ({ meta: [
    { title: "Media Verify — Trust Shield" }, { name: "description", content: "Photo, video and news claim verification (in development)." },
    { property: "og:title", content: "Media Verify — Trust Shield" }, { property: "og:description", content: "Verify photos, videos and news claims." },
  ] }),
  component: Page,
});

function Page() {
  const { t } = useLang();
  const items = [
    ["🖼️", "Photo Verification", "Metadata inspection, manipulation clues and AI-generated content signals, with reverse-image source checks."],
    ["🎬", "Video Verification", "Representative frame extraction, manipulation clues and detection of old footage reused as current events."],
    ["📰", "News Verification", "Compare headlines and claims with credible reporting and official UAE sources (WAM, NCEMA, police)."],
  ];
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHead title={t("media")} sub="Fight misinformation — especially conflict-related rumours and emergency panic messages." badge={`${t("comingSoon")} · Demo-only`} />
      <div className="grid md:grid-cols-3 gap-4">
        {items.map(([i, h, d]) => (
          <div key={h} className="glass p-6 opacity-90"><div className="text-3xl">{i}</div><h3 className="mt-3 font-semibold">{h}</h3><p className="text-sm text-muted-foreground mt-1">{d}</p>
            <span className="mt-4 inline-block text-[10px] rounded-full bg-warning/15 text-warning px-2 py-0.5">{t("comingSoon")}</span></div>
        ))}
      </div>
      <div className="mt-8 rounded-xl border-s-4 border-uae-red bg-card/50 p-5 text-sm">
        <div className="font-semibold">During emergencies</div>
        <p className="text-muted-foreground mt-1">Rely only on official channels: WAM news agency, NCEMA, and police accounts. Do not forward unverified videos or alerts — spreading rumours is an offence under UAE law.</p>
      </div>
    </div>
  );
}
