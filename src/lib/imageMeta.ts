// Reads an image's own metadata in the browser and looks for AI-generator tags
// (IPTC "trainedAlgorithmicMedia", Midjourney, DALL·E, Stable Diffusion, Firefly…).
// Most messaging apps strip metadata, so "nothing found" proves nothing.
const AI_HINTS: [RegExp, string][] = [
  [/trainedAlgorithmicMedia|compositeSynthetic/i, "IPTC: AI-generated media"],
  [/midjourney/i, "Midjourney"],
  [/dall[\s·.-]?e|openai|chatgpt/i, "OpenAI / DALL·E"],
  [/stable[\s-]?diffusion|automatic1111|comfyui/i, "Stable Diffusion"],
  [/firefly/i, "Adobe Firefly"],
  [/gemini|imagen/i, "Google Gemini / Imagen"],
  [/made with ai|ai[\s-]generated|generative ai/i, "AI-generated tag"],
];

export async function findAiInImageMetadata(file: File): Promise<string | null> {
  try {
    const exifr = (await import("exifr")).default;
    const meta = await exifr.parse(file, { xmp: true, iptc: true, icc: false, mergeOutput: true });
    if (!meta) return null;
    const haystack = JSON.stringify(meta);
    for (const [re, name] of AI_HINTS) if (re.test(haystack)) return name;
    return null;
  } catch {
    return null;
  }
}
