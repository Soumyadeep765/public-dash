import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { MarkdownView } from "@/components/MarkdownView";
import { BotRepoHeader } from "@/components/repo/BotRepoHeader";
import { FileTable } from "@/components/repo/FileTable";
import { JsonLd } from "@/components/repo/JsonLd";
import { RepoAboutSidebar } from "@/components/repo/RepoAboutSidebar";
import { AiCatalogCard } from "@/components/repo/AiCatalogCard";
import { RelatedBots } from "@/components/repo/RelatedBots";
import { ShareMenu } from "@/components/repo/ShareMenu";
import { AiBlurbMark } from "@/components/AiBlurbMark";
import { getRelatedPublicBots } from "@/lib/api";
import { findRepoFile, flattenUnder } from "@/lib/files";
import { getBotOgImageUrl } from "@/lib/botPhoto";
import { listDirEntries, loadRepoByIdResult } from "@/lib/repo";
import { absoluteUrl } from "@/lib/site";

type Params = Promise<{ username: string; botId: string }>;

export const revalidate = 15;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { username, botId } = await params;
  const result = await loadRepoByIdResult(username, botId);
  if (result.kind === "missing") return { title: `Bot ${botId}` };
  const { repo } = result;

  const title = `${repo.bot.name} · @${repo.handle}`;
  const description =
    (repo.bot.ai_description || repo.bot.description || "").trim().slice(0, 155) ||
    `${repo.bot.name} by @${repo.owner} on TeleDevs. Browse README, commands, and .env placeholders.`;
  const ogImage = getBotOgImageUrl(repo.bot.photo, repo.handle || repo.bot.bot_username);
  const ogImages = ogImage
    ? [{ url: ogImage, width: 400, height: 400, alt: repo.bot.name }]
    : undefined;

  return {
    title,
    description,
    keywords: [
      repo.handle,
      repo.owner,
      "TeleBotHost",
      "Telegram bot",
      repo.bot.listing_type_label || "published bot",
      repo.bot.ai_category,
      ...(Array.isArray(repo.bot.ai_tags) ? repo.bot.ai_tags : []),
    ].filter(Boolean) as string[],
    alternates: { canonical: absoluteUrl(repo.basePath) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(repo.basePath),
      type: "website",
      images: ogImages,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
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
  if (result.kind !== "ok") notFound();
  const { repo } = result;

  const { bot, owner, handle, tree, basePath } = repo;
  const entries = listDirEntries(tree, "");
  const readme = findRepoFile(tree, "README.md");
  const hasRealReadme = Boolean(bot.readme?.trim());
  const readmeFromAi =
    !hasRealReadme &&
    !String(bot.description || "").trim() &&
    Boolean(String(bot.ai_description || "").trim());

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
    description: [bot.ai_description, bot.description, `${bot.name} by @${owner} on TeleDevs.`].filter(Boolean).join(" "),
    url: absoluteUrl(basePath),
    codeRepository: absoluteUrl(basePath),
    programmingLanguage: "JavaScript",
    dateCreated: bot.created_at,
    dateModified: bot.updated_at,
    applicationCategory: bot.ai_category || "Bot",
    softwareRequirements: "Telegram",
    author: {
      "@type": "Person",
      name: owner,
      url: absoluteUrl(`/${owner}`),
    },
    image: getBotOgImageUrl(bot.photo, handle || bot.bot_username) || bot.photo || undefined,
    keywords: [
      handle,
      owner,
      "TeleBotHost",
      "Telegram bot",
      bot.listing_type_label || "published bot",
      bot.ai_category,
      ...(Array.isArray(bot.ai_tags) ? bot.ai_tags : []),
    ].filter(Boolean).join(", "),
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
            searchFiles={flattenUnder(tree)}
            fallbackUpdatedAt={bot.updated_at}
            searchable
          />

          {readme ? (
            <section className="box overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-border bg-canvas-subtle px-3 py-2">
                <h2 className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-semibold">
                  {hasRealReadme ? "README.md" : "Overview"}
                  {readmeFromAi ? <AiBlurbMark /> : null}
                </h2>
                <a href={`${basePath}/raw/README.md`} className="shrink-0 text-xs text-accent hover:underline">
                  View raw file
                </a>
              </div>
              <MarkdownView content={readme.content || ""} />
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <RepoAboutSidebar bot={bot} owner={owner} handle={handle} />
          <AiCatalogCard bot={bot} />
          <RelatedBots bots={related} owner={owner} />
        </aside>
      </div>
    </div>
  );
}
