import type { BotCommand, BotEnv, PublishedBotDetail, RepoFileNode } from "./types";

const KNOWN_EXTENSIONS = new Set([
  "js",
  "ts",
  "mjs",
  "cjs",
  "jsx",
  "tsx",
  "py",
  "json",
  "md",
  "txt",
  "yaml",
  "yml",
  "css",
  "html",
  "xml",
]);

/** Match TeleBotHost ZIP export naming (download.js) */
export function sanitizeCommandName(name: string): string {
  if (!name) return "unnamed_command";
  const clean = name.replace(/[\\/:*?"<>|]/g, "_");
  return clean || "command";
}

/**
 * Commands without an extension render as `.js` (GitHub-style file tree).
 * Names that already include a known extension keep it.
 */
export function commandFileName(commandName: string): string {
  const safe = sanitizeCommandName(commandName);
  const match = safe.match(/\.([a-zA-Z0-9]+)$/);
  if (match && KNOWN_EXTENSIONS.has(match[1].toLowerCase())) {
    return safe;
  }
  return `${safe}.js`;
}

export function languageFromFileName(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "js":
    case "mjs":
    case "cjs":
    case "jsx":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "py":
      return "python";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "env":
      return "dotenv";
    case "yaml":
    case "yml":
      return "yaml";
    case "css":
      return "css";
    case "html":
      return "html";
    case "xml":
      return "xml";
    default:
      return "text";
  }
}

export function buildEnvFileContent(envs: BotEnv[]): string {
  if (!envs.length) {
    return "# No environment variables published for this bot.\n";
  }

  return envs
    .map((env) => {
      const lines: string[] = [];
      if (env.placeholder) lines.push(`# ${env.placeholder}`);
      lines.push(`${env.name}=${env.value ?? ""}`);
      return `${lines.join("\n")}\n`;
    })
    .join("\n");
}

export function buildCommandFileContent(cmd: BotCommand): string {
  const aliasesStr = Array.isArray(cmd.aliases) ? cmd.aliases.join(",") : "";
  const header = [
    "/**#command",
    `name: ${cmd.name || ""}`,
    `answer: ${cmd.answer || ""}`,
    `keyboard: ${cmd.keyboard || ""}`,
    `parse_mode: ${cmd.parse_mode || ""}`,
    `aliases: ${aliasesStr}`,
    `allow_only_group: ${cmd.allow_only_group !== undefined ? cmd.allow_only_group : false}`,
    `need_reply: ${cmd.need_reply !== undefined ? cmd.need_reply : false}`,
    `is_web: ${cmd.is_web !== undefined ? cmd.is_web : 0}`,
    "#command**/",
    "",
    "",
  ].join("\n");

  return header + (cmd.code || "");
}

export function buildBotYaml(bot: PublishedBotDetail): string {
  const escape = (value: string) => value.replace(/"/g, '\\"');
  return [
    "# TeleBotHost Bot Configuration",
    `bot_id: ${bot.bot_id}`,
    `bot_name: "${escape(bot.name || "")}"`,
    `bot_username: "${escape((bot.bot_username || "").replace(/^@/, ""))}"`,
    `listing_type: ${bot.listing_type ?? "unknown"}`,
    `commands_count: ${bot.commands_count}`,
    `envs_count: ${bot.envs?.length ?? 0}`,
    "",
  ].join("\n");
}

function sanitizeFolderSegment(name: string): string {
  const clean = String(name || "")
    .trim()
    .replace(/[\\/:*?"<>|]/g, "_");
  return clean || "folder";
}

function toIso(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const raw = String(value);
  const t = Date.parse(raw);
  return Number.isFinite(t) ? new Date(t).toISOString() : null;
}

function maxIso(...values: Array<string | null | undefined>): string | null {
  let best: string | null = null;
  let bestMs = -Infinity;
  for (const value of values) {
    if (!value) continue;
    const ms = Date.parse(value);
    if (!Number.isFinite(ms)) continue;
    if (ms > bestMs) {
      bestMs = ms;
      best = value;
    }
  }
  return best;
}

function newestUpdatedAt(nodes: RepoFileNode[]): string | null {
  let best: string | null = null;
  for (const node of nodes) {
    best = maxIso(best, node.updatedAt || null);
    if (node.children?.length) best = maxIso(best, newestUpdatedAt(node.children));
  }
  return best;
}

export function buildRepoTree(bot: PublishedBotDetail): RepoFileNode[] {
  const botUpdated = toIso(bot.updated_at);
  const readme =
    bot.readme?.trim() ||
    `# ${bot.name}\n\n${bot.description || "No README published yet."}\n\n` +
      `Telegram: [@${(bot.bot_username || "").replace(/^@/, "")}](https://t.me/${(bot.bot_username || "").replace(/^@/, "")})\n`;

  const folderMap = new Map<string, RepoFileNode[]>();
  const rootCommands: RepoFileNode[] = [];

  (bot.commands || []).forEach((cmd, index) => {
    const name = commandFileName(cmd.name);
    const folderName = cmd.folder ? sanitizeFolderSegment(cmd.folder) : "";
    const path = folderName ? `commands/${folderName}/${name}` : `commands/${name}`;
    const updatedAt = toIso(cmd.updated_at) || toIso(cmd.created_at) || botUpdated;
    const node: RepoFileNode = {
      id: `cmd-${index}-${path}`,
      name,
      path,
      kind: "command",
      language: languageFromFileName(name),
      content: buildCommandFileContent(cmd),
      updatedAt,
    };
    if (folderName) {
      const list = folderMap.get(folderName) || [];
      list.push(node);
      folderMap.set(folderName, list);
    } else {
      rootCommands.push(node);
    }
  });

  rootCommands.sort((a, b) => a.name.localeCompare(b.name));

  const folderNodes: RepoFileNode[] = [...folderMap.entries()]
    .map(([folderName, children]) => {
      children.sort((a, b) => a.name.localeCompare(b.name));
      return {
        id: `folder-${folderName}`,
        name: folderName,
        path: `commands/${folderName}`,
        kind: "folder" as const,
        children,
        updatedAt: newestUpdatedAt(children),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const commandChildren = [...folderNodes, ...rootCommands];
  const commandsFolder: RepoFileNode = {
    id: "commands",
    name: "commands",
    path: "commands",
    kind: "folder",
    children: commandChildren,
    updatedAt: newestUpdatedAt(commandChildren) || botUpdated,
  };

  return [
    {
      id: "readme",
      name: "README.md",
      path: "README.md",
      kind: "readme",
      language: "markdown",
      content: readme,
      updatedAt: botUpdated,
    },
    {
      id: "env",
      name: ".env",
      path: ".env",
      kind: "env",
      language: "dotenv",
      content: buildEnvFileContent(bot.envs || []),
      updatedAt: botUpdated,
    },
    {
      id: "yaml",
      name: "bot.yaml",
      path: "bot.yaml",
      kind: "yaml",
      language: "yaml",
      content: buildBotYaml(bot),
      updatedAt: botUpdated,
    },
    commandsFolder,
  ];
}

/** All files under a directory (recursive). Empty dirPath = whole tree. */
export function flattenUnder(nodes: RepoFileNode[], dirPath = ""): RepoFileNode[] {
  if (!dirPath) return flattenRepoFiles(nodes);
  const folder = findRepoFile(nodes, dirPath);
  if (!folder || folder.kind !== "folder") return [];
  return flattenRepoFiles(folder.children || []);
}

export function flattenRepoFiles(nodes: RepoFileNode[]): RepoFileNode[] {
  const out: RepoFileNode[] = [];
  for (const node of nodes) {
    if (node.kind === "folder") {
      if (node.children) out.push(...flattenRepoFiles(node.children));
    } else {
      out.push(node);
    }
  }
  return out;
}

export function findRepoFile(nodes: RepoFileNode[], path: string): RepoFileNode | null {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findRepoFile(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

export function defaultFilePath(nodes: RepoFileNode[]): string {
  const readme = findRepoFile(nodes, "README.md");
  if (readme) return readme.path;
  const flat = flattenRepoFiles(nodes);
  return flat[0]?.path ?? "README.md";
}
