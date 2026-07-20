import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { MarkdownView } from "@/components/MarkdownView";
import { BlobCode } from "@/components/repo/BlobCode";
import { BotRepoHeader } from "@/components/repo/BotRepoHeader";
import { PathBreadcrumbs } from "@/components/repo/PathBreadcrumbs";
import { JsonLd } from "@/components/repo/JsonLd";
import { ShareMenu } from "@/components/repo/ShareMenu";
import {
  decodeRepoPath,
  getNodeAtPath,
  loadRepoByIdResult,
  repoBlobUrl,
  repoTreeUrl,
} from "@/lib/repo";
import { absoluteUrl } from "@/lib/site";

type Params = Promise<{ username: string; botId: string; path?: string[] }>;

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { username, botId, path: segments } = await params;
  const result = await loadRepoByIdResult(username, botId);
  if (result.kind === "missing") return { title: "Not found" };
  const { repo } = result;
  const filePath = decodeRepoPath(segments);
  if (!filePath) return { title: "File not found" };
  const node = getNodeAtPath(repo.tree, filePath);
  if (!node || node.kind === "folder") return { title: "File not found" };

  const title = `${filePath} · ${repo.owner}/${repo.handle}`;
  const description = `View ${filePath} from ${repo.bot.name} by @${repo.owner} on TeleBotHost Explore.`;
  const url = absoluteUrl(repoBlobUrl(repo.basePath, filePath));

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article" },
    robots: { index: true, follow: true },
  };
}

export default async function BlobByIdPage({ params }: { params: Params }) {
  const { username, botId, path: segments } = await params;
  if (!/^\d+$/.test(botId)) notFound();

  const result = await loadRepoByIdResult(username, botId);
  if (result.kind === "missing") notFound();

  const filePath = decodeRepoPath(segments);
  if (!filePath) notFound();
  if (result.kind === "wrong_owner") {
    permanentRedirect(repoBlobUrl(result.repo.basePath, filePath));
  }
  const repo = result.repo;

  const node = getNodeAtPath(repo.tree, filePath);
  if (!node || node.kind === "folder") notFound();

  const blobPath = repoBlobUrl(repo.basePath, filePath);
  const parentDir = filePath.includes("/")
    ? filePath.slice(0, filePath.lastIndexOf("/"))
    : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DigitalDocument",
    name: node.name,
    url: absoluteUrl(blobPath),
    encodingFormat:
      node.language === "markdown"
        ? "text/markdown"
        : node.language === "javascript"
          ? "text/javascript"
          : "text/plain",
    isPartOf: {
      "@type": "SoftwareSourceCode",
      name: repo.bot.name,
      url: absoluteUrl(repo.basePath),
    },
  };

  return (
    <div className="shell space-y-4">
      <JsonLd data={jsonLd} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <BotRepoHeader
            bot={repo.bot}
            owner={repo.owner}
            handle={repo.handle}
            basePath={repo.basePath}
          />
        </div>
        <ShareMenu pagePath={blobPath} filePath={filePath} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <PathBreadcrumbs
          basePath={repo.basePath}
          owner={repo.owner}
          handle={repo.handle}
          path={filePath}
          mode="blob"
        />
        <Link
          href={parentDir ? repoTreeUrl(repo.basePath, parentDir) : repo.basePath}
          className="text-xs text-accent hover:underline"
        >
          Back to folder
        </Link>
      </div>

      {node.kind === "readme" ? (
        <section className="box overflow-hidden">
          <div className="border-b border-border bg-canvas-subtle px-3 py-2 text-sm font-semibold">
            {node.name}
          </div>
          <MarkdownView content={node.content || ""} />
        </section>
      ) : (
        <BlobCode
          content={node.content || ""}
          language={node.language}
          fileName={node.path}
          blobPath={blobPath}
        />
      )}
    </div>
  );
}
