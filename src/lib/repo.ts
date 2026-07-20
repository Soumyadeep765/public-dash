import {
  ApiError,
  getPublicBotById,
  getPublicUserBot,
  type AmbiguousBotUsername,
} from "./api";
import { resolveUsername } from "./aliases";
import {
  buildRepoTree,
  findRepoFile,
  flattenRepoFiles,
} from "./files";
import { cleanBotUsername } from "./format";
import type { PublishedBotDetail, PublishedBotSummary, RepoFileNode } from "./types";

export type LoadedRepo = {
  bot: PublishedBotDetail;
  owner: string;
  handle: string;
  tree: RepoFileNode[];
  basePath: string;
};

export function botExplorePath(owner: string, botId: number | string): string {
  return `/${owner}/b/${botId}`;
}

function toLoadedRepo(bot: PublishedBotDetail, fallbackOwner: string): LoadedRepo {
  const owner = bot.owner_username || fallbackOwner;
  const handle = cleanBotUsername(bot.bot_username);
  return {
    bot,
    owner,
    handle,
    tree: buildRepoTree(bot),
    basePath: botExplorePath(owner, bot.bot_id),
  };
}

export type LoadRepoByIdResult =
  | { kind: "ok"; repo: LoadedRepo }
  | { kind: "wrong_owner"; repo: LoadedRepo }
  | { kind: "missing" };

export async function loadRepoByIdResult(
  rawUser: string,
  botId: number | string
): Promise<LoadRepoByIdResult> {
  const username = resolveUsername(rawUser);
  try {
    const bot = await getPublicBotById(botId);
    const repo = toLoadedRepo(bot, bot.owner_username || username);
    if (
      bot.owner_username &&
      bot.owner_username.toLowerCase() !== username.toLowerCase()
    ) {
      return { kind: "wrong_owner", repo };
    }
    return { kind: "ok", repo };
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.reason === "bot_not_found")) {
      return { kind: "missing" };
    }
    throw error;
  }
}

export async function loadRepoById(
  rawUser: string,
  botId: number | string
): Promise<LoadedRepo | null> {
  const result = await loadRepoByIdResult(rawUser, botId);
  if (result.kind === "missing") return null;
  return result.repo;
}

export type ResolveSlugResult =
  | { kind: "unique"; repo: LoadedRepo }
  | { kind: "ambiguous"; owner: string; botUsername: string; bots: PublishedBotSummary[] }
  | { kind: "missing" };

/** Resolve pretty `/{owner}/{botUsername}` slug among published bots. */
export async function resolveRepoSlug(
  rawUser: string,
  rawBot: string
): Promise<ResolveSlugResult> {
  const username = resolveUsername(rawUser);
  const botUsername = cleanBotUsername(rawBot);
  try {
    const bot = await getPublicUserBot(username, botUsername);
    return { kind: "unique", repo: toLoadedRepo(bot, username) };
  } catch (error) {
    if (error instanceof ApiError && error.reason === "ambiguous_bot_username") {
      const data = error.data as AmbiguousBotUsername | undefined;
      return {
        kind: "ambiguous",
        owner: data?.owner_username || username,
        botUsername: data?.bot_username || botUsername,
        bots: (data?.bots as PublishedBotSummary[]) || [],
      };
    }
    if (error instanceof ApiError && (error.status === 404 || error.reason === "bot_not_found")) {
      return { kind: "missing" };
    }
    throw error;
  }
}

/** @deprecated Prefer loadRepoById — slug lookup is ambiguous for clones. */
export async function loadRepo(rawUser: string, rawBot: string): Promise<LoadedRepo | null> {
  const resolved = await resolveRepoSlug(rawUser, rawBot);
  if (resolved.kind === "unique") return resolved.repo;
  return null;
}

export function repoTreeUrl(basePath: string, dirPath = ""): string {
  if (!dirPath || dirPath === ".") return basePath;
  return `${basePath}/tree/${encodeRepoPath(dirPath)}`;
}

export function repoBlobUrl(basePath: string, filePath: string, line?: number): string {
  const url = `${basePath}/blob/${encodeRepoPath(filePath)}`;
  return line ? `${url}#L${line}` : url;
}

export function encodeRepoPath(path: string): string {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function decodeRepoPath(segments: string[] | undefined): string {
  if (!segments?.length) return "";
  return segments.map((s) => decodeURIComponent(s)).join("/");
}

/** Children of a directory path ("" = root). Folders first, then files. */
export function listDirEntries(tree: RepoFileNode[], dirPath = ""): RepoFileNode[] {
  let nodes = tree;
  if (dirPath) {
    const folder = findRepoFile(tree, dirPath);
    if (!folder || folder.kind !== "folder") return [];
    nodes = folder.children || [];
  }

  const folders = nodes.filter((n) => n.kind === "folder").sort((a, b) => a.name.localeCompare(b.name));
  const files = nodes.filter((n) => n.kind !== "folder").sort((a, b) => a.name.localeCompare(b.name));
  return [...folders, ...files];
}

export function getNodeAtPath(tree: RepoFileNode[], path: string): RepoFileNode | null {
  if (!path) return null;
  return findRepoFile(tree, path);
}

export function allBlobPaths(tree: RepoFileNode[]): string[] {
  return flattenRepoFiles(tree).map((f) => f.path);
}

export function breadcrumbParts(path: string): Array<{ name: string; path: string }> {
  const parts = path.split("/").filter(Boolean);
  const out: Array<{ name: string; path: string }> = [];
  let acc = "";
  for (const part of parts) {
    acc = acc ? `${acc}/${part}` : part;
    out.push({ name: part, path: acc });
  }
  return out;
}
