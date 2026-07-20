import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BookOpen, Code2, FileCode2, FolderGit2, KeyRound } from "lucide-react";
import { StoreBotCard } from "@/components/StoreBotCard";
import { HomeSignedInBanner } from "@/components/HomeSignedIn";
import { BotPhoto } from "@/components/BotPhoto";
import { JsonLd } from "@/components/repo/JsonLd";
import { TbhLogo } from "@/components/TbhLogo";
import { listStoreBots, listTemplates } from "@/lib/api";
import { cleanBotUsername, timeAgo } from "@/lib/format";
import { botExplorePath } from "@/lib/repo";
import { pageMetadata, SITE_NAME } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { getConsoleSignupUrl } from "@/lib/session";
import type { PublishedBotDetail } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Public Telegram bots & developers",
    description:
      "Discover public TeleBotHost developers and published Telegram bots. Browse README docs, command source, and community store listings.",
    path: "/",
    keywords: ["Telegram bot showcase", "public bot repository"],
  }),
  title: {
    absolute: `${SITE_NAME} · Public Telegram bots & developers`,
  },
};

function pickRandom<T>(items: T[], count: number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

export default async function HomePage() {
  const [store, templatesRes] = await Promise.all([
    listStoreBots({ limit: 6 }).catch(() => ({
      bots: [],
      pagination: { page: 1, limit: 6, total: 0 },
    })),
    listTemplates({ limit: 24 }).catch(() => ({
      templates: [] as PublishedBotDetail[],
      pagination: { page: 1, limit: 24, total: 0 },
    })),
  ]);

  const templates = pickRandom(templatesRes.templates, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: SITE_NAME,
    description:
      "Public TeleBotHost developers, bot templates, and community store listings.",
    url: absoluteUrl("/"),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
  };

  return (
    <div className="shell space-y-10">
      <JsonLd data={jsonLd} />
      <HomeSignedInBanner />

      <section className="border-b border-border pb-10">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-5 flex justify-center text-fg">
            <TbhLogo className="h-12 w-12" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            TeleDevs
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted">
            The public side of TeleBotHost. Open a developer profile, read the README, and browse
            command source like a repo. Official product. Same platform you already use to host
            bots.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Link href="/explore" className="btn btn-primary">
              Browse bots
            </Link>
            <a href={getConsoleSignupUrl()} className="btn">
              Get started
            </a>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Feature
          icon={<FolderGit2 size={16} />}
          title="Repo-style bots"
          body="Each published bot opens with a file tree and shareable paths."
        />
        <Feature
          icon={<Code2 size={16} />}
          title="Commands as .js"
          body="Command files you can open, link, and copy from."
        />
        <Feature
          icon={<KeyRound size={16} />}
          title=".env placeholders"
          body="Env names and placeholders only. Secrets stay private."
        />
        <Feature
          icon={<BookOpen size={16} />}
          title="README first"
          body="Docs render on the bot page so visitors get the story fast."
        />
      </section>

      {templates.length ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Bot templates</h2>
              <p className="text-sm text-muted">Shareable blueprints with README and source</p>
            </div>
            <Link href="/templates" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((bot) => {
              const owner = bot.owner_username || "unknown";
              const username = cleanBotUsername(bot.bot_username);
              return (
                <Link
                  key={bot.bot_id}
                  href={botExplorePath(owner, bot.bot_id)}
                  className="box flex h-full flex-col p-4 hover:bg-row-hover"
                >
                  <div className="flex gap-3">
                    <BotPhoto
                      photo={bot.photo}
                      username={bot.bot_username}
                      name={bot.name}
                      className="h-10 w-10 rounded-md border border-border object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-accent">{bot.name}</h3>
                      <p className="truncate text-sm text-muted">@{username}</p>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted">
                    {bot.description || "Open to browse template source."}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span className="label">Template</span>
                    <span className="inline-flex items-center gap-1">
                      <FileCode2 size={12} />
                      {bot.commands_count} commands
                    </span>
                    <span>Updated {timeAgo(bot.updated_at)}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted">by @{owner}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">From the community store</h2>
            <p className="text-sm text-muted">Published listings you can open and share</p>
          </div>
          <Link href="/explore" className="text-sm text-accent hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {store.bots.map((bot) => (
            <StoreBotCard key={bot._id} bot={bot} />
          ))}
        </div>
      </section>

      <section className="box flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold">Build on TeleBotHost</h3>
          <p className="text-sm text-muted">
            Host bots in the console, publish when you are ready, and share the TeleDevs link.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={getConsoleSignupUrl()} className="btn btn-primary">
            Create account
          </a>
          <Link href="/how-it-works" className="btn">
            How it works
          </Link>
        </div>
      </section>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="box p-4">
      <div className="mb-2 text-muted">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </div>
  );
}
