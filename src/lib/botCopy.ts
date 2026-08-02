/** Prefer AI summary when present; fall back to owner description. */
export function botListingBlurb(bot: {
  description?: string | null;
  ai_description?: string | null;
  name?: string | null;
}, fallback = ""): string {
  const ai = String(bot.ai_description || "").trim();
  if (ai) return ai;
  const desc = String(bot.description || "").trim();
  if (desc) return desc;
  return fallback || String(bot.name || "").trim() || "";
}

export function formatAiCategory(category?: string | null): string | null {
  const c = String(category || "").trim();
  if (!c || c.toLowerCase() === "unknown") return null;
  return c
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export function cleanAiTags(tags?: string[] | null, limit = 8): string[] {
  if (!Array.isArray(tags)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    const tag = String(raw || "").trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
    if (out.length >= limit) break;
  }
  return out;
}
