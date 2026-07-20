export const CURRENT_ACCOUNT_COOKIE =
  process.env.NEXT_PUBLIC_TBH_ACCOUNT_COOKIE || "tbh_current_account";

const SAVED_ACCOUNTS_COOKIE = "tbh_saved_accounts";
const HANDOFF_FLAG = "tbh_console_handoff_v1";
const ACCOUNT_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export type CurrentAccount = {
  id?: string | null;
  username: string;
  name: string;
  avatar: string;
  userId: string | null;
  email: string | null;
  updatedAt?: number;
};

export type SessionSnapshot = {
  account: CurrentAccount | null;
  accounts: CurrentAccount[];
};

function normalizeAccount(data: Partial<CurrentAccount> | null | undefined): CurrentAccount | null {
  if (!data || typeof data !== "object") return null;
  const username = String(data.username || "")
    .trim()
    .replace(/^@/, "");
  if (!username) return null;
  return {
    id: data.id ? String(data.id) : null,
    username,
    name: String(data.name || "").trim(),
    avatar: String(data.avatar || "").trim(),
    userId: data.userId ? String(data.userId) : null,
    email: data.email ? String(data.email).trim().toLowerCase() : null,
    updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : undefined,
  };
}

export function parseCurrentAccountCookie(raw: string | undefined | null): CurrentAccount | null {
  if (!raw) return null;
  try {
    let text = raw;
    try {
      text = decodeURIComponent(raw);
    } catch {
      text = raw;
    }
    const data = JSON.parse(text) as Partial<CurrentAccount> & {
      account?: Partial<CurrentAccount>;
      accounts?: Partial<CurrentAccount>[];
    };
    // Support legacy single-account and newer { account, accounts } payloads
    if (data.account || Array.isArray(data.accounts)) {
      return normalizeAccount(data.account || data.accounts?.[0] || null);
    }
    return normalizeAccount(data);
  } catch {
    return null;
  }
}

function parseAccountsList(raw: string | undefined | null): CurrentAccount[] {
  if (!raw) return [];
  try {
    let text = raw;
    try {
      text = decodeURIComponent(raw);
    } catch {
      text = raw;
    }
    const data = JSON.parse(text) as unknown;
    if (!Array.isArray(data)) return [];
    return data.map((item) => normalizeAccount(item as Partial<CurrentAccount>)).filter(Boolean) as CurrentAccount[];
  } catch {
    return [];
  }
}

function parseHandoffPayload(raw: string): SessionSnapshot {
  if (!raw) return { account: null, accounts: [] };
  try {
    const data = JSON.parse(decodeURIComponent(raw)) as {
      account?: Partial<CurrentAccount> | null;
      accounts?: Partial<CurrentAccount>[];
      username?: string;
    };
    if (data && (data.account !== undefined || Array.isArray(data.accounts))) {
      const accounts = Array.isArray(data.accounts)
        ? (data.accounts.map((item) => normalizeAccount(item)).filter(Boolean) as CurrentAccount[])
        : [];
      // Explicit null = signed out (do not fall back to accounts[0])
      const account =
        data.account === null
          ? null
          : normalizeAccount(data.account) || (data.account === undefined ? accounts[0] || null : null);
      return { account, accounts: dedupeAccounts(account, accounts) };
    }
    const account = normalizeAccount(data as Partial<CurrentAccount>);
    return { account, accounts: account ? [account] : [] };
  } catch {
    return { account: null, accounts: [] };
  }
}

function dedupeAccounts(active: CurrentAccount | null, list: CurrentAccount[]): CurrentAccount[] {
  const map = new Map<string, CurrentAccount>();
  const keyOf = (a: CurrentAccount) => a.id || a.userId || a.username;
  if (active) map.set(keyOf(active), active);
  for (const item of list) {
    const key = keyOf(item);
    if (!map.has(key)) map.set(key, item);
  }
  const all = [...map.values()];
  if (!active) return all;
  return [active, ...all.filter((a) => keyOf(a) !== keyOf(active))];
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

function writeCookie(name: string, value: string | null, maxAge = ACCOUNT_COOKIE_MAX_AGE): void {
  if (typeof document === "undefined") return;
  if (!value) {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
    return;
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

/** Write first-party account hint cookie on TeleDevs (no JWT). */
export function writeCurrentAccountCookie(account: CurrentAccount | null): void {
  if (!account?.username) {
    writeCookie(CURRENT_ACCOUNT_COOKIE, null);
    return;
  }
  const payload = {
    id: account.id || null,
    username: account.username,
    name: account.name || "",
    avatar: account.avatar || "",
    userId: account.userId,
    email: account.email,
    updatedAt: account.updatedAt || Date.now(),
  };
  writeCookie(CURRENT_ACCOUNT_COOKIE, JSON.stringify(payload));
}

export function writeSavedAccountsCookie(accounts: CurrentAccount[]): void {
  if (!accounts.length) {
    writeCookie(SAVED_ACCOUNTS_COOKIE, null);
    return;
  }
  const payload = accounts.map((account) => ({
    id: account.id || null,
    username: account.username,
    name: account.name || "",
    avatar: account.avatar || "",
    userId: account.userId,
    email: account.email,
  }));
  writeCookie(SAVED_ACCOUNTS_COOKIE, JSON.stringify(payload));
}

export function writeSessionSnapshot(snapshot: SessionSnapshot): void {
  writeCurrentAccountCookie(snapshot.account);
  writeSavedAccountsCookie(snapshot.accounts);
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

/** Client-side cookie hint (same host as TeleDevs). */
export function getCurrentAccountFromDocument(): CurrentAccount | null {
  return parseCurrentAccountCookie(readCookieRaw(CURRENT_ACCOUNT_COOKIE));
}

export function getSavedAccountsFromDocument(): CurrentAccount[] {
  const listed = parseAccountsList(readCookieRaw(SAVED_ACCOUNTS_COOKIE));
  const active = getCurrentAccountFromDocument();
  return dedupeAccounts(active, listed);
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

/** Console deep link that clones a public bot then opens `#botdash/{newId}/tab/dash`. */
export function getConsoleForkUrl(botId: string | number): string {
  return `${getConsoleBaseUrl()}/#fork/${botId}`;
}

/** Login, then return to the fork deep link. */
export function getConsoleForkLoginUrl(botId: string | number): string {
  return getConsoleLoginUrl(`/#fork/${botId}`);
}

export function getConsoleBotDashUrl(botId: string | number): string {
  return `${getConsoleBaseUrl()}/#botdash/${botId}/tab/dash`;
}

/** TeleDevs login page (Continue with TeleBotHost). */
export function getTeledevsLoginPath(nextPath?: string, opts?: { switch?: boolean }): string {
  const params = new URLSearchParams();
  if (nextPath) params.set("next", nextPath);
  if (opts?.switch) params.set("switch", "1");
  const q = params.toString();
  return q ? `/login?${q}` : "/login";
}

function resetHandoffFlag(): void {
  try {
    sessionStorage.removeItem(HANDOFF_FLAG);
  } catch {
    /* ignore */
  }
}

function openBridge(returnPath: string, params: Record<string, string> = {}): void {
  if (typeof window === "undefined") return;
  resetHandoffFlag();
  const returnUrl = new URL(returnPath, window.location.origin);
  const bridge = new URL(getConsoleBridgeUrl());
  bridge.searchParams.set("return", returnUrl.toString());
  Object.entries(params).forEach(([key, value]) => {
    if (value) bridge.searchParams.set(key, value);
  });
  window.location.href = bridge.toString();
}

/**
 * Continue with TeleBotHost — explicit user action.
 * Bridge uses the active console session when present; only opens login if none.
 */
export function continueWithTelebothost(returnPath = "/"): void {
  openBridge(returnPath, { login: "1" });
}

/**
 * Open console saved-account picker (not a blank add form).
 * Keeps the current TeleDevs session until a new handoff arrives.
 */
export function switchTelebothostAccount(returnPath = "/"): void {
  openBridge(returnPath, { switch: "1" });
}

/** Add a brand-new console account, then return. */
export function addTelebothostAccount(returnPath = "/"): void {
  openBridge(returnPath, { add: "1" });
}

/** Switch to a saved console account by id (no login form). */
export function activateTelebothostAccount(
  accountId: string,
  returnPath = "/",
  opts?: { userId?: string | null; username?: string | null },
): void {
  const params: Record<string, string> = {};
  if (accountId) params.activate = accountId;
  if (opts?.userId) params.userId = String(opts.userId);
  if (opts?.username) params.username = String(opts.username).replace(/^@/, "");
  if (!params.activate && !params.userId && !params.username) return;
  openBridge(returnPath, params);
}

export function signOutTeledevs(): void {
  writeSessionSnapshot({ account: null, accounts: [] });
  resetHandoffFlag();
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
 * Consume `#tbh-account=...` handoff from console explore-bridge.
 * Returns snapshot. Undefined if no handoff hash.
 */
export function consumeAccountHandoffFromHash(): SessionSnapshot | undefined {
  if (typeof window === "undefined") return undefined;
  const hash = window.location.hash || "";
  if (!hash.startsWith("#tbh-account=")) return undefined;

  const raw = hash.slice("#tbh-account=".length);
  try {
    sessionStorage.setItem(HANDOFF_FLAG, "1");
  } catch {
    /* ignore */
  }

  try {
    const clean = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, "", clean);
  } catch {
    /* ignore */
  }

  // Empty hash = console had no active session. Clear active user only;
  // keep the saved-account list so switch UI still works.
  if (!raw) {
    const kept = getSavedAccountsFromDocument();
    writeCurrentAccountCookie(null);
    writeSavedAccountsCookie(kept);
    return { account: null, accounts: kept };
  }

  const snapshot = parseHandoffPayload(raw);
  writeSessionSnapshot(snapshot);
  return snapshot;
}

/**
 * Ask the console bridge iframe for the active account + saved list.
 * Often blocked by storage partitioning — optional enhancement only.
 */
export function fetchSessionFromConsoleBridge(timeoutMs = 1800): Promise<SessionSnapshot> {
  if (typeof window === "undefined") {
    return Promise.resolve({ account: null, accounts: [] });
  }

  return new Promise((resolve) => {
    const bridgeUrl = getConsoleBridgeUrl();
    let settled = false;
    const iframe = document.createElement("iframe");
    iframe.src = bridgeUrl;
    iframe.title = "TeleBotHost session";
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
      "position:absolute;width:0;height:0;border:0;clip:rect(0,0,0,0);opacity:0;pointer-events:none";

    const finish = (snapshot: SessionSnapshot) => {
      if (settled) return;
      settled = true;
      window.removeEventListener("message", onMessage);
      window.clearTimeout(timer);
      iframe.remove();
      resolve(snapshot);
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
      const account = normalizeAccount(data.account as Partial<CurrentAccount> | null);
      const accounts = Array.isArray(data.accounts)
        ? (data.accounts.map((item: Partial<CurrentAccount>) => normalizeAccount(item)).filter(Boolean) as CurrentAccount[])
        : account
          ? [account]
          : [];
      finish({ account, accounts: dedupeAccounts(account, accounts) });
    };

    window.addEventListener("message", onMessage);
    const timer = window.setTimeout(() => finish({ account: null, accounts: [] }), timeoutMs);

    iframe.addEventListener("load", () => {
      try {
        iframe.contentWindow?.postMessage(
          { type: "tbh-account-request", source: "telebothost-explore" },
          new URL(bridgeUrl).origin,
        );
      } catch {
        /* ignore */
      }
    });

    document.body.appendChild(iframe);
  });
}

/** @deprecated use fetchSessionFromConsoleBridge */
export function fetchAccountFromConsoleBridge(timeoutMs = 1800): Promise<CurrentAccount | null> {
  return fetchSessionFromConsoleBridge(timeoutMs).then((s) => s.account);
}

/**
 * Resolve signed-in account optionally.
 * Never forces console login. If console session is readable, load it; else stay signed out.
 */
export async function resolveSession(): Promise<SessionSnapshot> {
  const fromHandoff = consumeAccountHandoffFromHash();
  if (fromHandoff !== undefined) return fromHandoff;

  const cookieAccount = getCurrentAccountFromDocument();
  const cookieAccounts = getSavedAccountsFromDocument();
  if (cookieAccount) {
    return { account: cookieAccount, accounts: dedupeAccounts(cookieAccount, cookieAccounts) };
  }

  const fromApi = await fetchAccountFromApi();
  if (fromApi) {
    const snapshot = { account: fromApi, accounts: dedupeAccounts(fromApi, cookieAccounts) };
    writeSessionSnapshot(snapshot);
    return snapshot;
  }

  // Best-effort iframe probe only — never top-level bounce / never force login
  const fromBridge = await fetchSessionFromConsoleBridge();
  if (fromBridge.account) {
    writeSessionSnapshot(fromBridge);
    return fromBridge;
  }

  return { account: null, accounts: cookieAccounts };
}

/** @deprecated use resolveSession */
export async function resolveCurrentAccount(): Promise<CurrentAccount | null> {
  const snapshot = await resolveSession();
  return snapshot.account;
}
