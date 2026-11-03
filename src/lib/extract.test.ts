import { describe, it, expect } from "vitest";
import { extractParts } from "./extract";

describe("extract parts from pasted text", () => {
  it("finds a phone number and IBAN in a family-emergency message", () => {
    const x = extractParts("Mum it's me, this is my new number +44 7700 900123. Send AED 4,000 to AE07 0331 2345 6789 0123 456, it's urgent.");
    expect(x.phones).toEqual(["+44 7700 900123"]);
    expect(x.ibans).toEqual(["AE07 0331 2345 6789 0123 456"]);
    expect(x.links).toEqual([]);
  });
  it("finds a link and strips trailing punctuation", () => {
    const x = extractParts("Your parcel is on hold. Pay here: https://aramex-uae-pay.com/track.");
    expect(x.links).toEqual(["https://aramex-uae-pay.com/track"]);
  });
  it("finds a bare domain and a UAE mobile number", () => {
    const x = extractParts("Visit emiratesnbd-verify.xyz or call 050 123 4567");
    expect(x.links).toEqual(["emiratesnbd-verify.xyz"]);
    expect(x.phones).toEqual(["050 123 4567"]);
  });
  it("does not read amounts or card digits as phones", () => {
    const x = extractParts("Card ending 4421 was used for AED 85.00 on 03/11.");
    expect(x).toEqual({ links: [], ibans: [], phones: [] });
  });
});
