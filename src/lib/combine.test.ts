import { describe, it, expect } from "vitest";
import { analyzeCombined, interpretDetection } from "./combine";

const base = { text: "", link: "", phone: "", iban: "", mediaKind: "none" as const };

describe("combined check", () => {
  it("voice note + family emergency + IBAN is high risk and flags the combination", () => {
    const r = analyzeCombined({ ...base, mediaKind: "voice", text: "Mum I had an accident, send AED 4,000 now to this account", iban: "AE07 0331 2345 6789 0123 456" });
    expect(r.level).toBe("high");
    expect(r.signals.some((s) => s.label === "Media + money request together")).toBe(true);
  });
  it("media alone, no money request, is not flagged as the combination", () => {
    const r = analyzeCombined({ ...base, mediaKind: "image", text: "Look at this photo from the trip" });
    expect(r.signals.some((s) => s.label === "Media + money request together")).toBe(false);
  });
  it("a likely-fake detection adds a strong signal", () => {
    const r = analyzeCombined({ ...base, mediaKind: "voice", media: { status: "likely_fake", source: "test-model" } });
    expect(r.signals.some((s) => s.weight >= 3.5)).toBe(true);
  });
  it("never claims safety when media was not checked", () => {
    const r = analyzeCombined({ ...base, mediaKind: "voice" });
    expect(r.notes.join(" ")).toMatch(/not checked/);
  });
  it("Arabic output is available", () => {
    const r = analyzeCombined({ ...base, mediaKind: "voice", iban: "AE07 0331 2345 6789 0123 456" }, "ar");
    expect(r.signals.some((s) => s.label === "مقطع وطلب مال معاً")).toBe(true);
  });
});

describe("detection mapping", () => {
  it("maps a confident fake label", () => expect(interpretDetection([{ label: "fake", score: 0.92 }, { label: "real", score: 0.08 }])).toBe("likely_fake"));
  it("maps a confident real label", () => expect(interpretDetection([{ label: "bonafide", score: 0.95 }])).toBe("no_signs"));
  it("middle scores are inconclusive", () => expect(interpretDetection([{ label: "spoof", score: 0.5 }])).toBe("inconclusive"));
  it("unknown labels are inconclusive", () => expect(interpretDetection([{ label: "LABEL_0", score: 0.99 }])).toBe("inconclusive"));
});

import { checkParts } from "./combine";
describe("what we checked", () => {
  it("lists one line per part and never marks an unchecked voice note as safe", () => {
    const parts = checkParts({ text: "Send AED 4,000 now, urgent, don't tell dad", link: "", phone: "+44 7700 900123", iban: "AE07 0331 2345 6789 0123 456", mediaKind: "voice" });
    expect(parts.map((p) => p.key)).toEqual(["media", "message", "phone", "iban"]);
    expect(parts[0]!.status).toBe("not_checked");
    expect(parts[3]!.status).not.toBe("no_signs");
  });
  it("does not double count a link that is inside the message", () => {
    const text = "Your parcel is held. Pay now: http://aramex-uae-pay.xyz/track";
    const a = analyzeCombined({ ...base, text, link: "http://aramex-uae-pay.xyz/track" });
    const b = analyzeCombined({ ...base, text });
    expect(a.score).toBe(b.score);
  });
});
