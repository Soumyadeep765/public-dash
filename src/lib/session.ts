export const CURRENT_ACCOUNT_COOKIE =
  process.env.NEXT_PUBLIC_TBH_ACCOUNT_COOKIE || "tbh_current_account";

export type CurrentAccount = {
  username: string;
  name: string;
  avatar: string;
  userId: string | null;
  email: string | null;
  updatedAt?: number;
};

export function parseCurrentAccountCookie(raw: string | undefined | null): CurrentAccount | null {
  if (!raw) return null;
  try {
    let text = raw;
    try {
      text = decodeURIComponent(raw);
    } catch {
      text = raw;
    }
    const data = JSON.parse(text) as Partial<CurrentAccount>;
    const username = String(data.username || "")
      .trim()
      .replace(/^@/, "");
    if (!username) return null;
    return {
      username,
      name: String(data.name || "").trim(),
      avatar: String(data.avatar || "").trim(),
      userId: data.userId ? String(data.userId) : null,
      email: data.email ? String(data.email).trim().toLowerCase() : null,
      updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : undefined,
    };
  } catch {
    return null;
  }
}

function readCookieRaw(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    if (part.startsWith(prefix)) return part.slice(prefix.length);
  }
  return null;
}

/** Optional signed-in profile hint. Never throws. */
export async function getCurrentAccount(): Promise<CurrentAccount | null> {
  try {
    const { cookies } = await import("next/headers");
    const jar = await cookies();
    return parseCurrentAccountCookie(jar.get(CURRENT_ACCOUNT_COOKIE)?.value);
  } catch {
    return null;
  }
}

/** Client-side cookie hint (same host as Explore). */
export function getCurrentAccountFromDocument(): CurrentAccount | null {
  return parseCurrentAccountCookie(readCookieRaw(CURRENT_ACCOUNT_COOKIE));
}

/** Production console. Override with NEXT_PUBLIC_CONSOLE_URL for local dash1. */
export function getConsoleBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_CONSOLE_URL?.replace(/\/$/, "") ||
    "https://console.telebothost.com"
  );
}

export function getConsoleBridgeUrl(): string {
  return `${getConsoleBaseUrl()}/explore-bridge`;
}

export function getConsoleLoginUrl(nextPath?: string): string {
  const base = `${getConsoleBaseUrl()}/login`;
  if (!nextPath) return base;
  try {
    const url = new URL(base);
    url.searchParams.set("next", nextPath);
    return url.toString();
  } catch {
    return base;
  }
}

export function getConsoleSignupUrl(): string {
  return `${getConsoleBaseUrl()}/signup`;
}

export function getConsoleDashboardUrl(): string {
  return `${getConsoleBaseUrl()}/`;
}

function accountFromUserPayload(user: Record<string, unknown> | null | undefined): CurrentAccount | null {
  if (!user || typeof user !== "object") return null;
  const profile = (user.profile || {}) as Record<string, unknown>;
  const username = String(profile.username || profile.username_small || "")
    .trim()
    .replace(/^@/, "");
  if (!username) return null;
  return {
    username,
    name: String(profile.name || username).trim(),
    avatar: String(profile.avatar || "").trim(),
    userId: user.id ? String(user.id) : user._id ? String(user._id) : null,
    email: user.mail ? String(user.mail).trim().toLowerCase() : null,
    updatedAt: Date.now(),
  };
}

/** Try API session cookie (credentials: include). */
export async function fetchAccountFromApi(): Promise<CurrentAccount | null> {
  const base =
    process.env.NEXT_PUBLIC_TBH_API_BASE?.replace(/\/$/, "") ||
    "https://api.telebothost.com/api/v1";
  try {
    const res = await fetch(`${base}/user/me`, {
      credentials: "include",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { success?: boolean; user?: Record<string, unknown> };
    if (!data?.success) return null;
    return accountFromUserPayload(data.user);
  } catch {
    return null;
  }
}

/**
 * Ask the console bridge iframe for the active account.
 * Works across localhost ports when cookie host-sharing does not.
 */
export function fetchAccountFromConsoleBridge(timeoutMs = 2500): Promise<CurrentAccount | null> {
  if (typeof window === "undefined") return Promise.resolve(null);

  return new Promise((resolve) => {
    const bridgeUrl = getConsoleBridgeUrl();
    let settled = false;
    const iframe = document.createElement("iframe");
    iframe.src = bridgeUrl;
    iframe.title = "TeleBotHost session";
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
      "position:absolute;width:0;height:0;border:0;clip:rect(0,0,0,0);opacity:0;pointer-events:none";

    const finish = (account: CurrentAccount | null) => {
      if (settled) return;
      settled = true;
      window.removeEventListener("message", onMessage);
      window.clearTimeout(timer);
      iframe.remove();
      resolve(account);
    };

    const onMessage = (event: MessageEvent) => {
      try {
        const consoleOrigin = new URL(bridgeUrl).origin;
        if (event.origin !== consoleOrigin) return;
      } catch {
        return;
      }
      const data = event.data;
      if (!data || data.source !== "telebothost-console" || data.type !== "tbh-account") {
        return;
      }
      const account = data.account as CurrentAccount | null;
      if (account?.username) {
        finish({
          username: String(account.username).replace(/^@/, ""),
          name: String(account.name || "").trim(),
          avatar: String(account.avatar || "").trim(),
          userId: account.userId ? String(account.userId) : null,
          email: account.email ? String(account.email).trim().toLowerCase() : null,
          updatedAt: account.updatedAt || Date.now(),
        });
      } else {
        finish(null);
      }
    };

    window.addEventListener("message", onMessage);
    const timer = window.setTimeout(() => finish(null), timeoutMs);

    iframe.addEventListener("load", () => {
      try {
        iframe.contentWindow?.postMessage(
          { type: "tbh-account-request", source: "telebothost-explore" },
          new URL(bridgeUrl).origin
        );
      } catch {
        /* ignore */
      }
    });

    document.body.appendChild(iframe);
  });
}

/** Resolve signed-in account: cookie → API session → console bridge. */
export async function resolveCurrentAccount(): Promise<CurrentAccount | null> {
  const fromCookie = getCurrentAccountFromDocument();
  if (fromCookie) return fromCookie;

  const fromApi = await fetchAccountFromApi();
  if (fromApi) return fromApi;

  return fetchAccountFromConsoleBridge();
}
