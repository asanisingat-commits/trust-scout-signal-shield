// Server-side AI media detection through the Hugging Face Inference API.
// The token stays on the server. Configure in the hosting secrets:
//   HF_TOKEN         — Hugging Face access token
//   HF_AUDIO_MODEL   — e.g. an audio deepfake / anti-spoofing classifier
//   HF_IMAGE_MODEL   — e.g. an AI-generated image classifier
// Without them the function answers "not_checked" and the app stays honest about it.
import { createServerFn } from "@tanstack/react-start";
import { interpretDetection, type MediaFinding } from "./combine";

type Input = { kind: "voice" | "image"; mime: string; b64: string };

const MAX_BYTES = 6 * 1024 * 1024;

function env(name: string): string | undefined {
  try {
    return (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[name];
  } catch {
    return undefined;
  }
}

export const detectMedia = createServerFn({ method: "POST" })
  .validator((d: Input) => {
    if (!d || (d.kind !== "voice" && d.kind !== "image") || typeof d.b64 !== "string") throw new Error("Bad input");
    return d;
  })
  .handler(async ({ data }): Promise<MediaFinding> => {
    const token = env("HF_TOKEN");
    const model = data.kind === "voice" ? env("HF_AUDIO_MODEL") : env("HF_IMAGE_MODEL");
    if (!token || !model) return { status: "not_checked", source: "AI detection not connected yet" };

    const bytes = Uint8Array.from(atob(data.b64), (c) => c.charCodeAt(0));
    if (bytes.byteLength > MAX_BYTES) return { status: "inconclusive", source: `${model} (file too large)` };

    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 25000);
      const res = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": data.mime || "application/octet-stream" },
        body: bytes,
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) return { status: "inconclusive", source: `${model} (could not analyse)` };
      const json = (await res.json()) as unknown;
      const preds = Array.isArray(json) ? (Array.isArray(json[0]) ? json[0] : json) : [];
      return { status: interpretDetection(preds as { label: string; score: number }[]), source: model };
    } catch {
      return { status: "inconclusive", source: `${model} (could not analyse)` };
    }
    // The uploaded bytes are never stored: they live only in this request.
  });
