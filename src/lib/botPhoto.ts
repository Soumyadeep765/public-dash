const TELEGRAM_BAN_COUNTRIES = ["CN", "IR", "VN", "NP", "PK", "TH", "CU", "KE", "RU"] as const;
const TELEGRAM_DOMAIN = "tx.me";
const BOTPIC_HOST = "https://botpic.telebothost.com";
const COUNTRY_STORAGE_KEY = "detected_user_country";

export function cleanBotUsername(username?: string | null): string {
  return String(username || "")
    .trim()
    .replace(/^@/, "");
}

export function isTelegramBannedCountry(code?: string | null): boolean {
  const upper = String(code || "").trim().toUpperCase();
  if (!upper) return false;
  return (TELEGRAM_BAN_COUNTRIES as readonly string[]).includes(upper);
}

export function readCachedCountry(): string {
  if (typeof window === "undefined") return "";
  try {
    return (localStorage.getItem(COUNTRY_STORAGE_KEY) || "").toUpperCase();
  } catch {
    return "";
  }
}

export function writeCachedCountry(code: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COUNTRY_STORAGE_KEY, code.toUpperCase());
  } catch {
    // ignore
  }
}

export function avatarFallbackUrl(name?: string | null, size = 80): string {
  const label = encodeURIComponent(String(name || "B").trim() || "B");
  return `https://ui-avatars.com/api/?name=${label}&background=6366f1&color=fff&size=${size}`;
}

/** Same photo strategy as console (dash1): tx.me / botpic + smart fallbacks. */
export function getCleanBotPhotoUrl(
  photoUrl?: string | null,
  username?: string | null,
  botName?: string | null,
  banned = false,
): string {
  const cleanUsername = cleanBotUsername(username);

  if (banned) {
    if (cleanUsername) return `${BOTPIC_HOST}/${cleanUsername}.jpg`;
  } else if (cleanUsername) {
    return `https://${TELEGRAM_DOMAIN}/i/userpic/320/${cleanUsername}.svg`;
  }

  const url = String(photoUrl || "").trim();
  if (url && !url.includes("placeholder") && !url.includes("ui-avatars.com") && !url.includes("placehold.co")) {
    if (
      banned &&
      cleanUsername &&
      (url.includes("t.me/") || url.includes("tx.me") || url.includes(TELEGRAM_DOMAIN))
    ) {
      return `${BOTPIC_HOST}/${cleanUsername}.jpg`;
    }
    if (!banned && url.includes("botpic.telebothost.com/") && cleanUsername) {
      return `https://${TELEGRAM_DOMAIN}/i/userpic/320/${cleanUsername}.svg`;
    }
    return url;
  }

  return avatarFallbackUrl(botName);
}

export async function detectUserCountry(): Promise<string> {
  const cached = readCachedCountry();
  if (cached) return cached;

  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = (await res.json()) as { country_code?: string };
    if (data?.country_code) {
      const code = data.country_code.toUpperCase();
      writeCachedCountry(code);
      return code;
    }
  } catch {
    // try secondary
  }

  try {
    const res = await fetch("https://freeipapi.com/api/json");
    const data = (await res.json()) as { countryCode?: string };
    if (data?.countryCode) {
      const code = data.countryCode.toUpperCase();
      writeCachedCountry(code);
      return code;
    }
  } catch {
    // ignore
  }

  return "";
}
