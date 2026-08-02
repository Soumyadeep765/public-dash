export type BotDescriptionSource = {
  text: string;
  /** True when falling back to AI because owner description is empty */
  isAiGenerated: boolean;
};

/**
 * Prefer owner description; fall back to AI description when missing.
 */
export function resolveBotDescription(
  bot: {
    description?: string | null;
    ai_description?: string | null;
    name?: string | null;
  },
  fallback = ""
): BotDescriptionSource {
  const desc = String(bot.description || "").trim();
  if (desc) return { text: desc, isAiGenerated: false };

  const ai = String(bot.ai_description || "").trim();
  if (ai) return { text: ai, isAiGenerated: true };

  const fb = fallback || String(bot.name || "").trim() || "";
  return { text: fb, isAiGenerated: false };
}

/** @deprecated use resolveBotDescription — owner description first */
export function botListingBlurb(
  bot: {
    description?: string | null;
    ai_description?: string | null;
    name?: string | null;
  },
  fallback = ""
): string {
  return resolveBotDescription(bot, fallback).text;
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

export function hasAiCatalog(bot: {
  ai_category?: string | null;
  ai_description?: string | null;
  ai_tags?: string[] | null;
}): boolean {
  if (String(bot.ai_description || "").trim()) return true;
  if (formatAiCategory(bot.ai_category)) return true;
  return cleanAiTags(bot.ai_tags, 1).length > 0;
}
