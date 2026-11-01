import { describe, it, expect } from "vitest";
import { analyzeUrl, analyzeMessage, validateIban, analyzePhone } from "./detect";

describe("detection rules", () => {
  it("valid UAE IBAN passes checksum", () => { const r = validateIban("AE07 0331 2345 6789 0123 456"); expect(r.formatOk && r.checksumOk).toBe(true); });
  it("tampered IBAN fails checksum", () => { expect(validateIban("AE08 0331 2345 6789 0123 456").checksumOk).toBe(false); });
  it("brand impersonation URL is high risk", () => { expect(analyzeUrl("http://emiratesnbd-secure-login.xyz/verify").level).toBe("high"); });
  it("official domain not flagged as impersonation", () => { expect(analyzeUrl("https://www.emiratesnbd.com").signals.some(s => s.label.includes("impersonation"))).toBe(false); });
  it("OTP prize message is high risk", () => { expect(analyzeMessage("Congratulations! You won AED 50000. Send your OTP urgently").level).toBe("high"); });
  it("UAE mobile recognised", () => { const p = analyzePhone("050 123 4567"); expect(p.valid && p.type === "Mobile").toBe(true); });
});
