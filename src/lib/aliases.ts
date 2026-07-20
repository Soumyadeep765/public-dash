/** Optional username aliases → real TeleBotHost usernames */
const USER_ALIASES: Record<string, string> = {
  soumy: "soumyadeepdas",
};

export function resolveUsername(raw: string): string {
  const key = raw.trim().replace(/^@/, "").toLowerCase();
  return USER_ALIASES[key] ?? key;
}
