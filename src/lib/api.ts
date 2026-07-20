import { resolveUsername } from "./aliases";
import type {
  Pagination,
  PublicProfile,
  PublicSearchResult,
  PublishedBotDetail,
  PublishedBotSummary,
  StoreBot,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_TBH_API_BASE?.replace(/\/$/, "") ||
  "https://api.telebothost.com/api/v1";

export class ApiError extends Error {
  status: number;
  reason?: string;
  data?: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    reason?: string,
    data?: Record<string, unknown>
  ) {
    super(message);
    this.status = status;
    this.reason = reason;
    this.data = data;
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const isBrowser = typeof window !== "undefined";
  const res = await fetch(url, {
    ...init,
    // Browser calls include cookies so api.telebothost.com sessions work cross-site.
    credentials: init?.credentials ?? (isBrowser ? "include" : "omit"),
    headers: {
      Accept: "application/json",
      ...(init?.headers || {}),
    },
    ...(isBrowser ? { cache: "no-store" as RequestCache } : { next: { revalidate: 60 } }),
  });

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const data = (body || {}) as {
      message?: string;
      reason?: string;
      [key: string]: unknown;
    };
    throw new ApiError(
      data?.message || `Request failed (${res.status})`,
      res.status,
      data?.reason,
      data
    );
  }

  return body as T;
}

export async function getStatus() {
  return apiFetch<{ version: string; status: string; env: string }>("/status");
}

export async function getPublicProfile(username: string) {
  const resolved = resolveUsername(username);
  const data = await apiFetch<{ success: boolean; user: PublicProfile }>(
    `/public/user/${encodeURIComponent(resolved)}`
  );
  return data.user;
}

export async function getPublicUserBots(
  username: string,
  opts: { page?: number; limit?: number; listing_type?: string; q?: string } = {}
) {
  const resolved = resolveUsername(username);
  const params = new URLSearchParams();
  params.set("page", String(opts.page ?? 1));
  params.set("limit", String(opts.limit ?? 30));
  if (opts.listing_type) params.set("listing_type", opts.listing_type);
  if (opts.q) params.set("q", opts.q);

  return apiFetch<{
    success: boolean;
    username: string;
    published_bots: PublishedBotSummary[];
    pagination: Pagination;
  }>(`/public/user/${encodeURIComponent(resolved)}/bots?${params}`);
}

export async function getPublicBotById(botId: number | string) {
  const data = await apiFetch<{
    success: boolean;
    published_bot: PublishedBotDetail;
  }>(`/public/bots/${encodeURIComponent(String(botId))}`);
  return data.published_bot;
}

export async function getRelatedPublicBots(botId: number | string, limit = 6) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  const data = await apiFetch<{
    success: boolean;
    bot_id: number;
    owner_username: string | null;
    related_bots: PublishedBotSummary[];
  }>(`/public/bots/${encodeURIComponent(String(botId))}/related?${params}`);
  return data.related_bots;
}

/** Username lookup — may throw ApiError 409 with ambiguous bots list. */
export async function getPublicUserBot(username: string, botUsername: string) {
  const resolved = resolveUsername(username);
  const bot = botUsername.replace(/^@/, "");
  const data = await apiFetch<{
    success: boolean;
    published_bot: PublishedBotDetail;
  }>(
    `/public/user/${encodeURIComponent(resolved)}/bots/${encodeURIComponent(bot)}`
  );
  return data.published_bot;
}

export type AmbiguousBotUsername = {
  reason: "ambiguous_bot_username";
  bot_username: string;
  owner_username: string | null;
  bots: PublishedBotSummary[];
  message?: string;
};

export async function listStoreBots(opts: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
} = {}) {
  const params = new URLSearchParams();
  params.set("page", String(opts.page ?? 1));
  params.set("limit", String(opts.limit ?? 24));
  if (opts.search) params.set("search", opts.search);
  if (opts.category) params.set("category", opts.category);

  return apiFetch<{
    success: boolean;
    bots: StoreBot[];
    pagination: Pagination;
  }>(`/public/store/bots?${params}`);
}

export async function getStoreBot(botMetaId: string) {
  const data = await apiFetch<{ success: boolean; bot: StoreBot }>(
    `/public/store/bots/${encodeURIComponent(botMetaId)}`
  );
  return data.bot;
}

export async function listTemplates(opts: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) {
  const params = new URLSearchParams();
  params.set("page", String(opts.page ?? 1));
  params.set("limit", String(opts.limit ?? 24));
  if (opts.search) params.set("search", opts.search);

  return apiFetch<{
    success: boolean;
    templates: PublishedBotDetail[];
    pagination: Pagination;
  }>(`/public/templates?${params}`);
}

export async function searchPublic(opts: {
  q: string;
  type?: "all" | "users" | "bots";
  limit?: number;
}) {
  const params = new URLSearchParams();
  params.set("q", opts.q);
  if (opts.type) params.set("type", opts.type);
  if (opts.limit) params.set("limit", String(opts.limit));

  return apiFetch<PublicSearchResult & { success: boolean }>(
    `/public/search?${params}`
  );
}

export async function getAds() {
  try {
    return await apiFetch<{
      success: boolean;
      ads: Array<{
        id?: string;
        title?: string;
        description?: string;
        image?: string;
        link?: string;
      }>;
    }>("/public/ads");
  } catch {
    return { success: true, ads: [] };
  }
}

export { API_BASE };
