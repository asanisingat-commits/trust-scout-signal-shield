import { createFileRoute } from "@tanstack/react-router";
import { CheckPage } from "@/components/CheckPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trust Shield — Check before you pay" },
      { name: "description", content: "Paste a message, link, phone number or IBAN, add the voice note or image, and get one clear answer in Arabic or English before you pay." },
      { property: "og:title", content: "Trust Shield — Check before you pay" },
      { property: "og:description", content: "Scam and deepfake check in one tap, built for UAE residents." },
    ],
  }),
  component: CheckPage,
});
