import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { MarkdownView } from "@/components/MarkdownView";
import { BotRepoHeader } from "@/components/repo/BotRepoHeader";
import { FileTable } from "@/components/repo/FileTable";
import { JsonLd } from "@/components/repo/JsonLd";
import { RepoAboutSidebar } from "@/components/repo/RepoAboutSidebar";
import { RelatedBots } from "@/components/repo/RelatedBots";
import { ShareMenu } from "@/components/repo/ShareMenu";
import { getRelatedPublicBots } from "@/lib/api";
import { findRepoFile } from "@/lib/files";
import { listDirEntries, loadRepoByIdResult } from "@/lib/repo";
import { absoluteUrl } from "@/lib/site";

type Params = Promise<{ username: string; botId: string }>;

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { username, botId } = await params;
  const result = await loadRepoByIdResult(username, botId);
  if (result.kind === "missing") return { title: `Bot ${botId}` };
  const { repo } = result;

  const title = `${repo.bot.name} · @${repo.handle}`;
  const description =
    (repo.bot.description || "").trim().slice(0, 155) ||
    `${repo.bot.name} by @${repo.owner} on TeleDevs. Browse README, commands, and .env placeholders.`;

  return {
    title,
    description,
    keywords: [
      repo.handle,
      repo.owner,
      "TeleBotHost",
      "Telegram bot",
      repo.bot.listing_type_label || "published bot",
    ],
    alternates: { canonical: absoluteUrl(repo.basePath) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(repo.basePath),
      type: "website",
      images: repo.bot.photo ? [{ url: repo.bot.photo }] : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function BotRepoByIdPage({ params }: { params: Params }) {
  const { username, botId } = await params;
  if (!/^\d+$/.test(botId)) notFound();

  const result = await loadRepoByIdResult(username, botId);
  if (result.kind === "missing") notFound();
  if (result.kind === "wrong_owner") permanentRedirect(result.repo.basePath);
  const repo = result.repo;

  const { bot, owner, handle, tree, basePath } = repo;
  const entries = listDirEntries(tree, "");
  const readme = findRepoFile(tree, "README.md");

  let related: Awaited<ReturnType<typeof getRelatedPublicBots>> = [];
  try {
    related = await getRelatedPublicBots(bot.bot_id, 6);
  } catch {
    related = [];
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: bot.name,
    description: bot.description || bot.name,
    url: absoluteUrl(basePath),
    codeRepository: absoluteUrl(basePath),
    programmingLanguage: "JavaScript",
    author: {
      "@type": "Person",
      name: owner,
      url: absoluteUrl(`/${owner}`),
    },
    image: bot.photo || undefined,
  };

  return (
    <div className="shell space-y-4">
      <JsonLd data={jsonLd} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <BotRepoHeader bot={bot} owner={owner} handle={handle} basePath={basePath} />
        </div>
        <ShareMenu pagePath={basePath} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-4">
          <FileTable
            basePath={basePath}
            entries={entries}
            updatedAt={bot.updated_at}
            searchable
          />

          {readme ? (
            <section className="box overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-canvas-subtle px-3 py-2">
                <h2 className="text-sm font-semibold">README.md</h2>
                <a href={`${basePath}/blob/README.md`} className="text-xs text-accent hover:underline">
                  View raw file
                </a>
              </div>
              <MarkdownView content={readme.content || ""} />
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <RepoAboutSidebar bot={bot} owner={owner} handle={handle} />
          <RelatedBots bots={related} owner={owner} />
        </aside>
      </div>
    </div>
  );
}
