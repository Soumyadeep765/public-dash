import Link from "next/link";
import { ExternalLink, Eye, FileCode2, KeyRound } from "lucide-react";
import type { PublishedBotDetail } from "@/lib/types";
import { formatDate, timeAgo } from "@/lib/format";
import { botExplorePath } from "@/lib/repo";
import { ForkBotButton } from "@/components/repo/ForkBotButton";

export function BotRepoHeader({
  bot,
  owner,
  handle,
  basePath,
}: {
  bot: PublishedBotDetail;
  owner: string;
  handle: string;
  basePath?: string;
}) {
  const repoPath = basePath || botExplorePath(owner, bot.bot_id);

  return (
    <div className="space-y-3 border-b border-border pb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bot.photo || "/bot-fallback.svg"}
            alt=""
            className="h-8 w-8 rounded-md border border-border object-cover"
          />
          <div className="min-w-0">
            <h1 className="flex flex-wrap items-center gap-x-1 text-xl font-normal sm:text-2xl">
              <Link href={`/${owner}`} className="text-accent hover:underline">
                {owner}
              </Link>
              <span className="text-muted">/</span>
              <Link href={repoPath} className="font-semibold text-fg hover:underline">
                {handle}
              </Link>
              {bot.listing_type_label ? (
                <span className="label ml-2">Public · {bot.listing_type_label}</span>
              ) : (
                <span className="label ml-2">Public</span>
              )}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {bot.description || bot.name || "Public TeleBotHost bot"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <ForkBotButton botId={bot.bot_id} listingType={bot.listing_type} />
          <Link href={`/${owner}`} className="btn btn-sm">
            <Eye size={14} />
            Profile
          </Link>
          <a
            href={`https://t.me/${handle}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm"
          >
            Telegram
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted">
        <span className="inline-flex items-center gap-1">
          <FileCode2 size={14} />
          {bot.commands_count} commands
        </span>
        <span className="inline-flex items-center gap-1">
          <KeyRound size={14} />
          {bot.envs?.length ?? 0} env
        </span>
        <span>Updated {timeAgo(bot.updated_at)}</span>
        <span>Created {formatDate(bot.created_at)}</span>
      </div>
    </div>
  );
}
