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

import { extractParts } from "./extract";
describe("demo test messages", () => {
  const run = (text: string, mediaKind: "none" | "voice" = "none") => {
    const x = extractParts(text);
    return analyzeCombined({ text, link: x.links[0] ?? "", phone: x.phones[0] ?? "", iban: x.ibans[0] ?? "", mediaKind });
  };
  const SCAMS = [
    "Aramex: Your parcel is held at our facility due to an unpaid customs fee of AED 12.50. Pay within 24 hours or it will be returned: https://aramex-uae-pay.xyz/track",
    "Dear customer, your Emirates NBD account has been suspended due to unusual activity. Verify your details now to avoid permanent block: http://enbd-secure-verify.top/login",
    "Dubai Police: You have an unpaid traffic fine of AED 3,000. Pay immediately or your Emirates ID will be blocked. Pay here: dubaipolice-fines.info",
    "CONGRATULATIONS! You have WON AED 50,000 in the Etisalat anniversary draw. To claim, share the OTP code sent to your phone within 1 hour.",
    "Hi! We are hiring part-time. Earn AED 800 daily by liking videos. Simple tasks from home. Small deposit required to start. Contact us on WhatsApp +92 300 1234567",
    "Guaranteed 30% monthly profit with our crypto trading program. Limited slots, invest today, pay in USDT.",
    "عميلنا العزيز، تم إيقاف حسابك البنكي. يرجى تحديث بياناتك فوراً عبر الرابط: http://bank-update-uae.xyz لتجنب إغلاق الحساب.",
  ];
  it.each(SCAMS)("scam is high risk: %s", (m) => expect(run(m).level).toBe("high"));
  it("son voice-note scam is high risk", () => expect(run("Mum it's me, I had an accident and my phone broke, this is my new number +44 7700 900123. Please send AED 4,000 now to AE07 0331 2345 6789 0123 456, it's urgent. Don't tell dad.", "voice").level).toBe("high"));
  it.each([
    "Your card ending 4421 was used for AED 85.00 at a supermarket on 03/11. If this wasn't you, call the number on the back of your card.",
    "Hey, are we still meeting at 7 for dinner tonight? I booked a table.",
    "مرحبا، هل ما زلنا نلتقي الساعة السابعة للعشاء الليلة؟",
  ])("normal message stays low: %s", (m) => expect(run(m).level).toBe("low"));
});
