// Fill in after running the dataset test (see the team's Excel sheet).
// Leave a value as null until it is measured: the page then shows "Test in progress".
export const TEST_RESULTS = {
  /** Total files tested. */
  total: null as number | null,
  /** How many of them were real (genuine recordings/photos). */
  real: null as number | null,
  /** How many were fake (AI-generated or cloned). */
  fake: null as number | null,
  /** Fakes the tool labelled "Likely AI-generated", as a % of all fakes. */
  fakesCaughtPct: null as number | null,
  /** Real files wrongly labelled "Likely AI-generated", as a % of all real files. */
  falseAlarmPct: null as number | null,
  /** Files labelled "Inconclusive", as a % of all files. */
  inconclusivePct: null as number | null,
  /** Where the samples came from, shown under the numbers. */
  sources: "Our own recordings (with consent) and public deepfake datasets.",
  /** Date of the test, e.g. "3 Nov 2026". */
  date: null as string | null,
};
