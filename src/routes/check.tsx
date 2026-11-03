import { createFileRoute } from "@tanstack/react-router";
import { CheckPage } from "@/components/CheckPage";

// Kept so old links to /check still work; the home page is now the check itself.
export const Route = createFileRoute("/check")({
  head: () => ({ meta: [
    { title: "Check before you pay — Trust Shield" },
    { name: "description", content: "Check a message, link, phone number, IBAN, voice note or image together — one answer, before you pay." },
  ] }),
  component: CheckPage,
});
