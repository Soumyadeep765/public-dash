import Link from "next/link";
import type { Metadata } from "next";
import { User } from "lucide-react";
import { searchPublic } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";
import { botExplorePath } from "@/lib/repo";
import { botListingBlurb } from "@/lib/botCopy";
import { BotPhoto } from "@/components/BotPhoto";
import { AiCatalogMeta } from "@/components/AiCatalogMeta";

type SearchParams = Promise<{ q?: string; type?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q?.trim() || "";

  // Avoid indexing thin/duplicate search-result URLs
  return pageMetadata({
    title: q ? `Search: ${q}` : "Search",
    description:
      "Search TeleDevs for developers and published Telegram bots.",
    path: q ? `/search?q=${encodeURIComponent(q)}` : "/search",
    index: !q,
    follow: true,
  });
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const type =
    params.type === "users" || params.type === "bots" || params.type === "all"
      ? params.type
      : "all";

  const results = q
    ? await searchPublic({ q, type, limit: 20 }).catch(() => null)
    : null;

  return (
    <div className="shell space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Search</h1>
        <p className="mt-1 text-muted">
          Find developers and published bots by name, description, or AI tags.
        </p>
      </div>

      <form className="flex flex-col gap-2 sm:flex-row">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search users, bots, tags…"
          className="input"
          autoFocus
        />
        <select name="type" defaultValue={type} className="input sm:w-40">
          <option value="all">All</option>
          <option value="users">Developers</option>
          <option value="bots">Bots</option>
        </select>
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      {!q ? (
        <div className="box p-8 text-center text-sm text-muted">
          Type a username or bot name to get started.
        </div>
      ) : !results ? (
        <div className="box p-8 text-center text-sm text-muted">
          Search is unavailable right now. Try again shortly.
        </div>
      ) : (
        <div className="space-y-6">
          {(type === "all" || type === "users") && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-muted">
                Developers · {results.counts.users}
              </h2>
              <div className="box overflow-hidden">
                {results.users.length ? (
                  results.users.map((user) => (
                    <Link
                      key={user.id || user.username}
                      href={`/${user.username}`}
                      className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 hover:bg-row-hover"
                    >
                      {user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatar}
                          alt=""
                          className="h-9 w-9 rounded-full border border-border object-cover"
                        />
                      ) : (
                        <div className="grid h-9 w-9 place-items-center rounded-full border border-border bg-canvas-subtle">
                          <User size={14} className="text-muted" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-accent">@{user.username}</p>
                        <p className="truncate text-sm text-muted">
                          {user.name}
                          {user.stats?.published_bots
                            ? ` · ${user.stats.published_bots} published`
                            : ""}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="px-4 py-6 text-sm text-muted">No developers matched.</p>
                )}
              </div>
            </section>
          )}

          {(type === "all" || type === "bots") && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-muted">
                Bots · {results.counts.bots}
              </h2>
              <div className="box overflow-hidden">
                {results.bots.length ? (
                  results.bots.map((bot) => {
                    const owner = bot.owner_username || "unknown";
                    const handle = bot.bot_username.replace(/^@/, "");
                    const blurb = botListingBlurb(bot);
                    return (
                      <Link
                        key={`${bot.bot_id}-${handle}`}
                        href={botExplorePath(owner, bot.bot_id)}
                        className="flex items-start gap-3 border-b border-border px-4 py-3 last:border-b-0 hover:bg-row-hover"
                      >
                        <BotPhoto
                          photo={bot.photo}
                          username={bot.bot_username}
                          name={bot.name}
                          className="mt-0.5 h-9 w-9 rounded-md border border-border object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-accent">{bot.name}</p>
                          <p className="truncate text-sm text-muted">
                            @{handle} · by @{owner}
                            {bot.listing_type_label ? ` · ${bot.listing_type_label}` : ""}
                          </p>
                          {blurb ? (
                            <p className="mt-1 line-clamp-2 text-sm text-muted">{blurb}</p>
                          ) : null}
                          <AiCatalogMeta
                            category={bot.ai_category}
                            tags={bot.ai_tags}
                            className="mt-1.5"
                            maxTags={4}
                          />
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <p className="px-4 py-6 text-sm text-muted">No bots matched.</p>
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
