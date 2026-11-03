// Finds links, IBANs and phone numbers inside pasted text, so the user only has to paste once.
// Pure and tested (extract.test.ts).

export type Extracted = { links: string[]; ibans: string[]; phones: string[] };

const IBAN_RE = /\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]){11,30}\b/g;
const LINK_RE = /\b(?:https?:\/\/[^\s<>"']+|www\.[^\s<>"']+|(?:[a-z0-9-]+\.)+(?:com|ae|net|org|info|xyz|top|click|live|shop|site|online|link|app|ly|co|me|io)\b(?:\/[^\s<>"']*)?)/gi;
const PHONE_RE = /(?:\+|\b00)\d[\d\s-]{6,16}\d|\b0(?:5\d|[2-9])[\s-]?\d{3}[\s-]?\d{4}\b/g;

const uniq = (xs: string[]) => [...new Set(xs)];
const trimEnd = (s: string) => s.replace(/[.,;:!?)\]}'"»]+$/, "");

export function extractParts(text: string): Extracted {
  const ibans = uniq((text.match(IBAN_RE) || []).map((s) => s.trim()));
  let rest = text;
  for (const i of ibans) rest = rest.split(i).join(" ");
  const links = uniq((rest.match(LINK_RE) || []).map(trimEnd).filter((l) => !/@/.test(l)));
  for (const l of links) rest = rest.split(l).join(" ");
  const phones = uniq((rest.match(PHONE_RE) || []).map((s) => s.trim()));
  return { links, ibans, phones };
}

/** Short display version, e.g. "AE07 0331 …". */
export function shortIban(iban: string) {
  const c = iban.replace(/\s+/g, "");
  return `${c.slice(0, 4)} ${c.slice(4, 8)} …`;
}
