import Link from "next/link";
import { StoreBotCard } from "@/components/StoreBotCard";
import { listStoreBots, listTemplates } from "@/lib/api";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { cleanBotUsername, timeAgo } from "@/lib/format";
import { BotPhoto } from "@/components/BotPhoto";

export const metadata: Metadata = pageMetadata({
  title: "Explore bots",
  description:
    "Browse TeleBotHost community store listings and templates. Open public Telegram bots, READMEs, and command source.",
  path: "/explore",
  keywords: ["Telegram bot store", "community bots", "TeleBotHost store", "bot templates"],
});

export const revalidate = 60;

type SearchParams = Promise<{ q?: string; page?: string; tab?: string }>;

export default async function ExplorePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const page = Math.max(1, Number(params.page || "1") || 1);
  const tab = params.tab === "templates" ? "templates" : "store";

  let storeData: {
    bots: any[];
    pagination: { page: number; limit: number; total: number; pages?: number };
  } = {
    bots: [],
    pagination: { page: 1, limit: 24, total: 0, pages: 0 },
  };

  let templateData: {
    templates: any[];
    pagination: { page: number; limit: number; total: number; pages?: number };
  } = {
    templates: [],
    pagination: { page: 1, limit: 24, total: 0, pages: 0 },
  };

  if (tab === "store") {
    storeData = await listStoreBots({ search: q || undefined, page, limit: 24 }).catch(() => ({
      bots: [],
      pagination: { page: 1, limit: 24, total: 0, pages: 0 },
    }));
  } else {
    templateData = await listTemplates({ search: q || undefined, page, limit: 24 }).catch(() => ({
      templates: [],
      pagination: { page: 1, limit: 24, total: 0, pages: 0 },
    }));
  }

  const totalPages = tab === "store" ? storeData.pagination.pages : templateData.pagination.pages;

  return (
    <div className="shell space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Explore bots</h1>
        <p className="mt-1 text-muted">Discover public bots, templates, and listings from TeleBotHost.</p>
      </div>

      <div className="flex border-b border-border text-sm font-medium">
        <Link
          href={`/explore?tab=store${q ? `&q=${encodeURIComponent(q)}` : ""}`}
          className={`px-4 py-2 border-b-2 -mb-[2px] transition-colors ${
            tab === "store"
              ? "border-accent text-accent font-semibold"
              : "border-transparent text-muted hover:text-fg"
          }`}
        >
          Community Store
        </Link>
        <Link
          href={`/explore?tab=templates${q ? `&q=${encodeURIComponent(q)}` : ""}`}
          className={`px-4 py-2 border-b-2 -mb-[2px] transition-colors ${
            tab === "templates"
              ? "border-accent text-accent font-semibold"
              : "border-transparent text-muted hover:text-fg"
          }`}
        >
          Templates & Blueprints
        </Link>
      </div>

      <form className="flex flex-col gap-2 sm:flex-row">
        <input
          name="q"
          defaultValue={q}
          placeholder={tab === "store" ? "Search store bots…" : "Search templates…"}
          className="input"
        />
        <input type="hidden" name="tab" value={tab} />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      {tab === "store" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {storeData.bots.map((bot) => (
              <StoreBotCard key={bot._id} bot={bot} />
            ))}
          </div>

          {!storeData.bots.length ? (
            <div className="box p-8 text-center text-muted">No store bots found.</div>
          ) : null}
        </>
      ) : (
        <>
          {templateData.templates.length ? (
            <div className="box overflow-hidden divide-y divide-border">
              {templateData.templates.map((bot) => {
                const owner = bot.owner_username || "unknown";
                const username = cleanBotUsername(bot.bot_username);
                return (
                  <Link
                    key={bot.bot_id}
                    href={`/${owner}/b/${bot.bot_id}`}
                    className="flex items-start gap-3 px-4 py-4 hover:bg-row-hover"
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
          ) : (
            <div className="box p-8 text-center text-muted">No templates found.</div>
          )}
        </>
      )}

      {totalPages && totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3 text-sm">
          {page > 1 ? (
            <Link
              href={`/explore?page=${page - 1}&tab=${tab}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className="btn btn-sm"
            >
              Previous
            </Link>
          ) : null}
          <span className="text-muted">
            Page {page} of {totalPages}
          </span>
          {page < (totalPages || 1) ? (
            <Link
              href={`/explore?page=${page + 1}&tab=${tab}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className="btn btn-sm"
            >
              Next
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
