import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { BotRepoHeader } from "@/components/repo/BotRepoHeader";
import { FileTable } from "@/components/repo/FileTable";
import { PathBreadcrumbs } from "@/components/repo/PathBreadcrumbs";
import { ShareMenu } from "@/components/repo/ShareMenu";
import { flattenUnder } from "@/lib/files";
import {
  decodeRepoPath,
  getNodeAtPath,
  listDirEntries,
  loadRepoByIdResult,
  repoTreeUrl,
} from "@/lib/repo";
import { absoluteUrl } from "@/lib/site";

type Params = Promise<{ username: string; botId: string; path?: string[] }>;

export const revalidate = 15;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { username, botId, path: segments } = await params;
  const result = await loadRepoByIdResult(username, botId);
  if (result.kind === "missing") return { title: "Not found" };
  const { repo } = result;
  const dirPath = decodeRepoPath(segments);
  const title = dirPath
    ? `${repo.owner}/${repo.handle}/${dirPath}`
    : `${repo.owner}/${repo.handle}`;
  const url = absoluteUrl(repoTreeUrl(repo.basePath, dirPath));
  return {
    title,
    description: `Browse ${dirPath || "files"} in ${repo.owner}/${repo.handle} on TeleDevs.`,
    alternates: { canonical: url },
    openGraph: { title, url, type: "website" },
    robots: { index: true, follow: true },
  };
}

export default async function TreeByIdPage({ params }: { params: Params }) {
  const { username, botId, path: segments } = await params;
  if (!/^\d+$/.test(botId)) notFound();

  const result = await loadRepoByIdResult(username, botId);
  if (result.kind === "missing") notFound();
  const dirPath = decodeRepoPath(segments);
  if (result.kind === "wrong_owner") {
    permanentRedirect(repoTreeUrl(result.repo.basePath, dirPath));
  }
  const repo = result.repo;
  if (dirPath) {
    const node = getNodeAtPath(repo.tree, dirPath);
    if (!node || node.kind !== "folder") notFound();
  }

  const entries = listDirEntries(repo.tree, dirPath);
  const pagePath = repoTreeUrl(repo.basePath, dirPath);

  return (
    <div className="shell space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <BotRepoHeader
            bot={repo.bot}
            owner={repo.owner}
            handle={repo.handle}
            basePath={repo.basePath}
          />
        </div>
        <ShareMenu pagePath={pagePath} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <PathBreadcrumbs
          basePath={repo.basePath}
          owner={repo.owner}
          handle={repo.handle}
          path={dirPath}
          mode="tree"
        />
        {dirPath ? (
          <Link href={repo.basePath} className="text-xs text-accent hover:underline">
            Back to root
          </Link>
        ) : null}
      </div>

      <FileTable
        basePath={repo.basePath}
        entries={entries}
        searchFiles={flattenUnder(repo.tree, dirPath)}
        fallbackUpdatedAt={repo.bot.updated_at}
        searchable
      />
    </div>
  );
}
