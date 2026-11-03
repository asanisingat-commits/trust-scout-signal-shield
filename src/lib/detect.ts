// Rule-based, transparent detection logic. No random scores; every point comes from a named rule.
export type Signal = { label: string; detail: string; weight: number };
export type Result = {
  score: number; // 1-10 (1 = no warning signs found)
  level: "low" | "medium" | "high";
  confidence: "low" | "moderate" | "strong";
  signals: Signal[];
  recommendations: string[];
  inconclusive: boolean;
  notes: string[];
};

export function finalize(signals: Signal[], recs: string[], notes: string[] = [], minSignalsForConfidence = 2): Result {
  const raw = signals.reduce((s, x) => s + x.weight, 0);
  const score = Math.max(1, Math.min(10, Math.round((1 + raw) * 10) / 10));
  const level = score >= 7 ? "high" : score >= 4 ? "medium" : "low";
  const strong = signals.filter((s) => s.weight >= 2).length;
  const confidence = strong >= minSignalsForConfidence ? "strong" : signals.length >= 2 ? "moderate" : "low";
  const inconclusive = signals.length === 0 || (level === "low" && confidence === "low");
  return { score, level, confidence, signals, recommendations: recs, inconclusive, notes };
}

const BRANDS: Record<string, string[]> = {
  "Emirates NBD": ["emiratesnbd.com"], ADCB: ["adcb.com"], FAB: ["bankfab.com"], Mashreq: ["mashreqbank.com", "mashreq.com"],
  "Dubai Police": ["dubaipolice.gov.ae"], "Abu Dhabi Police": ["adpolice.gov.ae"], ICP: ["icp.gov.ae"], "Emirates Post": ["emiratespost.ae"],
  Etisalat: ["etisalat.ae", "eand.com"], du: ["du.ae"], Aramex: ["aramex.com"], RTA: ["rta.ae"], Salik: ["salik.ae"],
  PayPal: ["paypal.com"], Amazon: ["amazon.ae", "amazon.com"], Noon: ["noon.com"], Apple: ["apple.com"], Microsoft: ["microsoft.com"],
  Emirates: ["emirates.com"], DEWA: ["dewa.gov.ae"], WhatsApp: ["whatsapp.com"], Google: ["google.com"],
};
const BRAND_KEYS: Record<string, string> = {
  emiratesnbd: "Emirates NBD", enbd: "Emirates NBD", adcb: "ADCB", bankfab: "FAB", mashreq: "Mashreq", dubaipolice: "Dubai Police",
  adpolice: "Abu Dhabi Police", icp: "ICP", emiratespost: "Emirates Post", etisalat: "Etisalat", aramex: "Aramex", rta: "RTA",
  salik: "Salik", paypal: "PayPal", amazon: "Amazon", noon: "Noon", apple: "Apple", icloud: "Apple", microsoft: "Microsoft",
  office365: "Microsoft", emirates: "Emirates", dewa: "DEWA", whatsapp: "WhatsApp", google: "Google",
};
const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "cutt.ly", "rb.gy", "shorturl.at", "tiny.cc"];
const RISKY_TLDS = ["xyz", "top", "click", "zip", "mov", "icu", "buzz", "tk", "ml", "ga", "cf", "gq", "rest", "cam", "sbs", "cfd", "live", "shop"];

export function analyzeUrl(input: string): Result {
  const signals: Signal[] = [];
  const notes: string[] = ["Rule-based structural analysis only. No external reputation database is connected yet, so a low score is NOT proof that a link is safe."];
  let raw = input.trim();
  if (!/^[a-z][a-z0-9+.-]*:/i.test(raw)) raw = "http://" + raw;
  let u: URL;
  try { u = new URL(raw); } catch {
    return finalize([{ label: "Invalid URL", detail: "The text could not be parsed as a web address.", weight: 3 }], ["Do not open this link."], notes);
  }
  if (!["http:", "https:"].includes(u.protocol))
    signals.push({ label: "Unusual scheme", detail: `Uses "${u.protocol}" which can run code or open apps.`, weight: 4 });
  const host = u.hostname.toLowerCase();
  if (u.protocol === "http:" && !input.trim().toLowerCase().startsWith("https") && /^http:/i.test(input.trim()))
    signals.push({ label: "No encryption (HTTP)", detail: "Data sent to this site is not encrypted.", weight: 1.5 });
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":"))
    signals.push({ label: "Raw IP address", detail: "Legitimate services almost always use a domain name, not an IP.", weight: 3 });
  if (host.split(".").some((p) => p.startsWith("xn--")))
    signals.push({ label: "Punycode / look-alike characters", detail: "Domain uses encoded international characters often used to imitate real brands.", weight: 3 });
  if (u.username || input.includes("@") && /https?:\/\/[^/]*@/i.test(raw))
    signals.push({ label: "'@' trick in URL", detail: "Everything before '@' is ignored by browsers, hiding the real destination.", weight: 3.5 });
  if (SHORTENERS.includes(host))
    signals.push({ label: "Link shortener", detail: "The real destination is hidden. Expand it before trusting it.", weight: 1.5 });
  const tld = host.split(".").pop() || "";
  if (RISKY_TLDS.includes(tld))
    signals.push({ label: `High-abuse domain ending (.${tld})`, detail: "This ending is frequently used in phishing campaigns.", weight: 1.5 });
  const labels = host.split(".");
  if (labels.length > 4) signals.push({ label: "Many subdomains", detail: `${labels.length} levels deep — often used to bury a fake brand name.`, weight: 1.5 });
  const hy = (host.match(/-/g) || []).length;
  if (hy >= 3) signals.push({ label: "Many hyphens in domain", detail: "Patterns like 'secure-login-bank-update' are typical of phishing.", weight: 1.5 });
  if (raw.length > 120) signals.push({ label: "Very long URL", detail: "Long links can hide the real destination.", weight: 0.5 });
  const kw = (u.pathname + u.search + host).toLowerCase().match(/login|signin|verify|update|secure|account|confirm|wallet|unlock|suspend|otp|kyc|payment|refund|reward|prize/g);
  if (kw) signals.push({ label: "Sensitive action keywords", detail: `Contains: ${[...new Set(kw)].join(", ")}.`, weight: Math.min(2, kw.length * 0.7) });
  const flat = host.replace(/[^a-z0-9]/g, "").replace(/0/g, "o").replace(/1/g, "l");
  const isOfficial = Object.values(BRANDS).flat().some((d) => host === d || host.endsWith("." + d));
  for (const [k, brand] of Object.entries(BRAND_KEYS)) {
    if (isOfficial) break;
    if (k.length < 4 && !labels.includes(k)) continue;
    if (flat.includes(k)) {
      const official = (BRANDS[brand] ?? []).some((d) => host === d || host.endsWith("." + d));
      if (!official) {
        signals.push({ label: `Possible ${brand} impersonation`, detail: `Mentions "${brand}" but is not on its official domain (${(BRANDS[brand] ?? []).join(", ")}).`, weight: 4 });
        break;
      }
    }
  }
  if (/\.(apk|exe|scr|bat|msi|js|vbs)$/i.test(u.pathname))
    signals.push({ label: "Direct file download", detail: "Link downloads an executable/app file.", weight: 3 });
  return finalize(signals, [
    "Type the official website address yourself instead of clicking links.",
    "Never enter card details, OTPs or UAE Pass credentials after following a link from a message.",
  ], notes);

}

const MSG_RULES: { re: RegExp; label: string; detail: string; weight: number }[] = [
  { re: /urgent|immediately|within (24|48) hours|act now|last (chance|warning)|final notice|عاجل|فورا|فوراً/i, label: "Urgency pressure", detail: "Scammers rush you so you don't stop to think.", weight: 1.5 },
  { re: /(you('ve| have)? won|winner|congratulations|prize|lottery|lucky draw|jackpot|مبروك|فزت|جائزة)/i, label: "Fake prize / lottery", detail: "You cannot win a draw you never entered.", weight: 2.5 },
  { re: /\b(otp|one[- ]time (pass|code)|verification code|pin|cvv|password|رمز التحقق|كلمة المرور)\b/i, label: "Requests secret codes", detail: "No bank or government entity will ever ask for your OTP, PIN or CVV.", weight: 3.5 },
  { re: /(account|card).{0,30}(blocked|suspended|frozen|locked|deactivated)|emirates id.{0,20}(expired|blocked)|(موقوف|مجمد|محظور)|(إيقاف|ايقاف|تعليق|إغلاق|اغلاق|تجميد|حظر) (حساب|بطاق)|حسابك.{0,20}(موقوف|مجمد|معلق|محظور)/i, label: "Account suspension threat", detail: "Threatening to block your account or Emirates ID is a classic phishing hook.", weight: 2.5 },
  { re: /(transfer|send|pay|deposit).{0,40}(aed|dhs|dirham|usd|\$|money|fee|amount)|(processing|delivery|customs|clearance|registration|activation) fee|(small|refundable|security|initial) deposit|deposit (is )?(required|needed|first)|حول|تحويل|إيداع|ايداع|ادفع رسوم/i, label: "Payment request", detail: "Asks you to send money or pay an unexpected fee.", weight: 2 },
  { re: /gift ?card|itunes card|google play card|crypto|bitcoin|usdt|binance|western union/i, label: "Untraceable payment method", detail: "Gift cards and crypto are favoured because they cannot be reversed.", weight: 2.5 },
  { re: /(dubai police|abu dhabi police|icp|ministry of interior|moi|emirates post|aramex|etisalat|\bdu\b|emirates nbd|adcb|fab|mashreq|central bank|rta|salik|dewa|شرطة دبي|وزارة الداخلية|البنك المركزي)/i, label: "Mentions a trusted UAE entity", detail: "Impersonation of police, banks, couriers or telecoms is the most common UAE scam pattern. Verify through official channels.", weight: 1.5 },
  { re: /(work from home|tasks? from home|we are hiring|hiring part[- ]time|part[- ]time (job|work)|simple tasks|عمل من المنزل|دوام جزئي|earn (aed|\$)?\s?\d+.{0,10}(day|daily)|like (videos|posts) and earn|task.{0,10}commission)/i, label: "Job / task scam pattern", detail: "Easy-money tasks often end with you paying 'deposits'.", weight: 2.5 },
  { re: /(guaranteed.{0,25}(returns?|profits?|income)|\d+ ?% (daily|weekly|monthly) (profit|return)|double your|investment (opportunity|program|plan)|trading program|forex|100% profit|أرباح مضمونة|ربح مضمون)/i, label: "Investment fraud language", detail: "Guaranteed high returns are a hallmark of investment fraud.", weight: 2.5 },
  { re: /(dear (customer|user|sir|madam)|valued customer|عميلنا العزيز|عزيزي العميل)/i, label: "Generic greeting", detail: "Real organisations usually address you by name.", weight: 0.7 },
  { re: /(update|verify|confirm) your (details|information|account|data)|(تحديث|تأكيد|تحقق من) (بياناتك|البيانات|حسابك)/i, label: "Asks you to update your details", detail: "Real banks and government services never ask you to update details through a link in a message.", weight: 2 },
  { re: /(click (the )?(link|here)|tap (the )?link|اضغط على الرابط)/i, label: "Push to click a link", detail: "Asks you to act through a link instead of the official app.", weight: 1 },
  { re: /(don'?t tell|keep (this )?(secret|confidential)|do not share with)/i, label: "Secrecy request", detail: "Scammers isolate victims from people who could warn them.", weight: 1.5 },
  { re: /(package|parcel|shipment).{0,40}(held|pending|failed|unable to deliver)/i, label: "Fake delivery notice", detail: "Fake courier messages are widespread in the UAE.", weight: 2 },
];

export function analyzeMessage(text: string): Result {
  const signals: Signal[] = [];
  for (const r of MSG_RULES) if (r.re.test(text)) signals.push({ label: r.label, detail: r.detail, weight: r.weight });
  const urls = text.match(/(https?:\/\/[^\s]+|\b(?:[a-z0-9-]+\.)+(?:com|ae|net|org|xyz|top|click|info|live|shop|ly|co|me|io)\b[^\s]*)/gi) || [];
  let worst = 0, worstUrl = "";
  for (const link of urls.slice(0, 10)) { const r = analyzeUrl(link); if (r.score > worst) { worst = r.score; worstUrl = link; } }
  if (worst >= 4) signals.push({ label: "Contains a suspicious link", detail: `${worstUrl} scored ${worst}/10 in the URL scanner.`, weight: Math.min(4, worst / 2) });
  else if (urls.length) signals.push({ label: "Contains link(s)", detail: `${urls.length} link(s) found — no strong structural red flags, but verify independently.`, weight: 0.5 });
  if ((text.match(/[A-Z]{5,}/g) || []).length >= 2) signals.push({ label: "Shouting / ALL CAPS", detail: "Excessive capitals are used to create alarm.", weight: 0.5 });
  return finalize(signals, [
    "Do not reply, click links, or send money until you verify the sender through an official number or app.",
    "Never share OTPs, card PINs or UAE Pass details with anyone.",
    "Block the sender and report it inside the app (WhatsApp, Instagram, etc.).",

  ], ["Language-pattern analysis only. Scammers change wording often; a low score does not mean the message is genuine."]);
}

export function analyzePhone(input: string) {
  const digits = input.replace(/[^\d+]/g, "");
  let n = digits.replace(/^00/, "+");
  const signals: Signal[] = [];
  let country = "Unknown", type = "Unknown", valid = false;
  if (/^0(5\d|[2-9])\d{7}$/.test(n)) n = "+971" + n.slice(1);
  if (n.startsWith("+971")) {
    country = "United Arab Emirates";
    const local = n.slice(4);
    if (/^5[024568]\d{7}$/.test(local)) { valid = true; type = "Mobile"; }
    else if (/^[234679]\d{7}$/.test(local)) { valid = true; type = "Landline"; }
    else if (/^800\d{3,7}$/.test(local)) { valid = true; type = "Toll-free"; }
    else if (/^600\d{6}$/.test(local)) { valid = true; type = "Shared-cost (600)"; }
  } else if (/^\+\d{8,15}$/.test(n)) {
    valid = true; type = "International";
    const cc: Record<string, string> = { "+1": "USA/Canada", "+44": "United Kingdom", "+91": "India", "+92": "Pakistan", "+966": "Saudi Arabia", "+974": "Qatar", "+968": "Oman", "+965": "Kuwait", "+973": "Bahrain", "+20": "Egypt", "+63": "Philippines", "+234": "Nigeria", "+62": "Indonesia", "+880": "Bangladesh" };
    const hit = Object.keys(cc).sort((a, b) => b.length - a.length).find((k) => n.startsWith(k));
    country = (hit && cc[hit]) || "International";
  }
  if (!valid) signals.push({ label: "Invalid number format", detail: "This does not match a valid UAE or E.164 international format.", weight: 3 });
  if (valid && type === "International") signals.push({ label: "Foreign number", detail: "Messages claiming to be from UAE banks, police or couriers will not come from foreign numbers.", weight: 1.5 });
  return {
    normalized: valid ? n : null, country, type, valid,
    result: finalize(signals, [
      "Verify the caller by hanging up and calling the organisation's official number.",
      "Official UAE entities do not ask for OTPs or payments over WhatsApp.",
    ], ["No scam-report database is connected yet. A number with no reports is NOT proven safe."]),
  };
}

export function validateIban(input: string) {
  const iban = input.replace(/\s+/g, "").toUpperCase();
  const isUae = iban.startsWith("AE");
  const formatOk = isUae ? /^AE\d{21}$/.test(iban) : /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban);
  let checksumOk = false;
  if (formatOk) {
    const re = (iban.slice(4) + iban.slice(0, 4)).replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
    let rem = 0; for (const ch of re) rem = (rem * 10 + Number(ch)) % 97;
    checksumOk = rem === 1;
  }
  const masked = iban.length > 8 ? iban.slice(0, 4) + " •••• •••• " + iban.slice(-4) : "••••";
  return { iban, masked, isUae, formatOk, checksumOk, bankCode: isUae && formatOk ? iban.slice(4, 7) : null };
}
