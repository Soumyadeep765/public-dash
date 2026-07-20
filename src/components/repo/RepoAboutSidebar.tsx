import Link from "next/link";
import { ExternalLink, FileCode2, KeyRound, Terminal } from "lucide-react";
import type { PublishedBotDetail } from "@/lib/types";
import { formatDate, timeAgo } from "@/lib/format";
import { getConsoleBaseUrl } from "@/lib/session";

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

  return (
    <section className="box overflow-hidden">
      <div className="border-b border-border bg-canvas-subtle px-3 py-2">
        <h2 className="text-sm font-semibold">About</h2>
      </div>
      <div className="space-y-3 p-3 text-sm">
        <p className="text-muted">
          {bot.description || "No description provided."}
        </p>

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
          <a
            href={`https://t.me/${handle}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm btn-primary justify-center"
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
            <span className="grid h-7 w-7 place-items-center rounded-full border border-border bg-canvas-subtle text-xs font-semibold text-fg">
              {owner.slice(0, 1).toUpperCase()}
            </span>
            @{owner}
          </Link>
        </div>
      </div>
    </section>
  );
}
