import Link from "next/link";
import { ExternalLink, FileCode2, KeyRound, Sparkles, Terminal } from "lucide-react";
import type { PublishedBotDetail } from "@/lib/types";
import { formatDate, timeAgo } from "@/lib/format";
import { botListingBlurb } from "@/lib/botCopy";
import { getConsoleBaseUrl } from "@/lib/session";
import { ForkBotButton } from "@/components/repo/ForkBotButton";
import { AiCatalogMeta } from "@/components/AiCatalogMeta";

export function RepoAboutSidebar({
  bot,
  owner,
  handle,
}: {
  bot: PublishedBotDetail;
  owner: string;
  handle: string;
}) {
  const consoleUrl = getConsoleBaseUrl();
  const blurb = botListingBlurb(bot, "No description provided.");
  const ownerDesc = String(bot.description || "").trim();
  const aiDesc = String(bot.ai_description || "").trim();
  const showOwnerDesc = ownerDesc && aiDesc && ownerDesc !== aiDesc;

  return (
    <section className="box overflow-hidden">
      <div className="border-b border-border bg-canvas-subtle px-3 py-2">
        <h2 className="text-sm font-semibold">About</h2>
      </div>
      <div className="space-y-3 p-3 text-sm">
        <p className="text-muted">{blurb}</p>

        {(bot.ai_category || (bot.ai_tags && bot.ai_tags.length > 0)) ? (
          <div className="space-y-1.5">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              <Sparkles size={12} />
              AI catalog
            </p>
            <AiCatalogMeta category={bot.ai_category} tags={bot.ai_tags} maxTags={8} />
          </div>
        ) : null}

        {showOwnerDesc ? (
          <div className="rounded-md border border-border bg-canvas-subtle px-2.5 py-2">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Owner description
            </p>
            <p className="text-muted">{ownerDesc}</p>
          </div>
        ) : null}

        {bot.listing_type_label ? (
          <p>
            <span className="label">{bot.listing_type_label}</span>
          </p>
        ) : null}

        <ul className="space-y-2 text-muted">
          <li className="inline-flex items-center gap-2">
            <FileCode2 size={14} />
            {bot.commands_count} commands
          </li>
          <li className="inline-flex items-center gap-2">
            <KeyRound size={14} />
            {bot.envs?.length ?? 0} env variables
          </li>
          <li>Updated {timeAgo(bot.updated_at)}</li>
          <li>Created {formatDate(bot.created_at)}</li>
          <li className="font-mono text-xs">ID {bot.bot_id}</li>
        </ul>

        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <div className="[&_button]:w-full [&_button]:justify-center">
            <ForkBotButton botId={bot.bot_id} listingType={bot.listing_type} />
          </div>
          <a
            href={`https://t.me/${handle}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm justify-center"
          >
            Open on Telegram
            <ExternalLink size={14} />
          </a>
          <a
            href={consoleUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm justify-center"
          >
            <Terminal size={14} />
            Open console
          </a>
        </div>

        <div className="border-t border-border pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Owner
          </p>
          <Link
            href={`/${owner}`}
            className="inline-flex items-center gap-2 text-accent hover:underline"
          >
            {bot.owner_avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bot.owner_avatar}
                alt=""
                className="h-7 w-7 rounded-full border border-border object-cover"
              />
            ) : (
              <span className="grid h-7 w-7 place-items-center rounded-full border border-border bg-canvas-subtle text-xs font-semibold text-fg">
                {owner.slice(0, 1).toUpperCase()}
              </span>
            )}
            @{owner}
          </Link>
        </div>
      </div>
    </section>
  );
}
