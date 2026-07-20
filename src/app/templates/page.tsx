import Link from "next/link";
import { listTemplates } from "@/lib/api";
import { cleanBotUsername, timeAgo } from "@/lib/format";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { BotPhoto } from "@/components/BotPhoto";

export const metadata: Metadata = pageMetadata({
  title: "Bot templates",
  description:
    "Browse shareable TeleBotHost bot templates. Open blueprints with README docs, env placeholders, and command source.",
  path: "/templates",
  keywords: ["Telegram bot templates", "bot blueprints"],
});

export const revalidate = 15;

type SearchParams = Promise<{ q?: string }>;

export default async function TemplatesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = params.q?.trim() || "";

  const data = await listTemplates({ search: q || undefined, limit: 30 }).catch(() => ({
    templates: [],
    pagination: { page: 1, limit: 30, total: 0 },
  }));

  return (
    <div className="shell space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Templates</h1>
        <p className="mt-1 text-muted">Shareable bot blueprints.</p>
      </div>

      <form className="flex flex-col gap-2 sm:flex-row">
        <input name="q" defaultValue={q} placeholder="Search templates…" className="input" />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      {!data.templates.length ? (
        <div className="box p-10 text-center">
          <p className="font-semibold">No public templates yet</p>
          <p className="mt-1 text-sm text-muted">Browse the community store meanwhile.</p>
          <div className="mt-4 flex justify-center gap-2">
            <Link href="/explore" className="btn btn-primary">
              Community store
            </Link>
          </div>
        </div>
      ) : (
        <div className="box overflow-hidden">
          {data.templates.map((bot) => {
            const owner = bot.owner_username || "unknown";
            const username = cleanBotUsername(bot.bot_username);
            return (
              <Link
                key={bot.bot_id}
                href={`/${owner}/b/${bot.bot_id}`}
                className="flex items-start gap-3 border-b border-border px-4 py-4 last:border-b-0 hover:bg-row-hover"
              >
                <BotPhoto
                  photo={bot.photo}
                  username={bot.bot_username}
                  name={bot.name}
                  className="h-8 w-8 rounded-md border border-border object-cover"
                />
                <div className="min-w-0">
                  <h2 className="font-semibold text-accent">{bot.name}</h2>
                  <p className="text-sm text-muted">
                    @{username} · by @{owner}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {bot.description || "Open to browse template source."}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {bot.commands_count} commands · updated {timeAgo(bot.updated_at)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
