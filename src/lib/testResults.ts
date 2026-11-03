// Measured results of the text check (message + link + phone + IBAN rules) on public datasets.
// Method: each dataset was split in half by row order. Rules were improved using the even rows only;
// the numbers below come from the odd rows, which were never used to write the rules.
// Media (voice note / image) detection is NOT included here: it needs the AI model connected first.
export type DatasetResult = {
  name: string;
  nameAr: string;
  url: string;
  /** Scam messages tested. */
  scams: number;
  /** Scams marked orange ("Be careful") or red ("Do not pay"). */
  flagged: number;
  /** Scams marked red ("Do not pay"). */
  doNotPay: number;
  /** Normal messages tested (0 if the dataset has none). */
  normal: number;
  /** Normal messages wrongly marked orange or red. */
  falseAlarms: number;
  note: string;
  noteAr: string;
};

export const TEST_RESULTS = {
  date: "3 Nov 2026",
  datasets: [
    {
      name: "SMS Phishing Dataset (Mishra & Soni, 2022)",
      nameAr: "مجموعة بيانات التصيّد عبر الرسائل (ميشرا وسوني، 2022)",
      url: "https://data.mendeley.com/datasets/f45bkkt8pr",
      scams: 331, flagged: 197, doNotPay: 70,
      normal: 2414, falseAlarms: 5,
      note: "Labelled scam (\"smishing\") and normal SMS, mostly UK and India.",
      noteAr: "رسائل احتيال ورسائل عادية مصنّفة، معظمها من المملكة المتحدة والهند.",
    },
    {
      name: "Fishing for Smishing — real victim reports (IMC 2025)",
      nameAr: "بلاغات حقيقية من ضحايا رسائل الاحتيال (مؤتمر IMC 2025)",
      url: "https://github.com/reportsmishing/Smishing-Dataset-IMC25",
      scams: 16079, flagged: 7220, doNotPay: 2531,
      normal: 0, falseAlarms: 0,
      note: "Scam texts reported by the public worldwide, in English or translated to English. The researchers removed all links and brand names for privacy, so our link and brand checks could not run on this set.",
      noteAr: "رسائل احتيال أبلغ عنها الجمهور حول العالم، بالإنجليزية أو مترجمة إليها. حذف الباحثون جميع الروابط وأسماء العلامات التجارية حفاظاً على الخصوصية، لذا لم تعمل فحوص الروابط والعلامات التجارية على هذه المجموعة.",
    },
  ] as DatasetResult[],
};

export const pct = (x: number, n: number) => (n ? Math.round((x / n) * 1000) / 10 : 0);
