/** Prefer owner description; fall back to AI summary. */
export type ListingBlurb = {
  text: string;
  /** True when shown text comes from ai_description (no owner/store description). */
  fromAi: boolean;
};

export function resolveListingBlurb(
  bot: {
    description?: string | null;
    ai_description?: string | null;
    name?: string | null;
  },
  fallback = "",
): ListingBlurb {
  const desc = String(bot.description || "").trim();
  if (desc) return { text: desc, fromAi: false };

  const ai = String(bot.ai_description || "").trim();
  if (ai) return { text: ai, fromAi: true };

  const fb = fallback || String(bot.name || "").trim() || "";
  return { text: fb, fromAi: false };
}

export function botListingBlurb(
  bot: {
    description?: string | null;
    ai_description?: string | null;
    name?: string | null;
  },
  fallback = "",
): string {
  return resolveListingBlurb(bot, fallback).text;
}

export function isAiPrimaryBlurb(bot: {
  description?: string | null;
  ai_description?: string | null;
}): boolean {
  return resolveListingBlurb(bot).fromAi;
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
