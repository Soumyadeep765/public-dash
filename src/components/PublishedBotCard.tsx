import Link from "next/link";
import { FileCode2, Star } from "lucide-react";
import type { PublishedBotSummary } from "@/lib/types";
import { cleanBotUsername, timeAgo } from "@/lib/format";
import { botExplorePath } from "@/lib/repo";
import { resolveListingBlurb } from "@/lib/botCopy";
import { BotPhoto } from "@/components/BotPhoto";
import { AiCatalogMeta } from "@/components/AiCatalogMeta";
import { AiBlurbMark } from "@/components/AiBlurbMark";

export function PublishedBotCard({
  bot,
  username,
}: {
  bot: PublishedBotSummary;
  username: string;
}) {
  const botUser = cleanBotUsername(bot.bot_username);
  const owner = bot.owner_username || username;
  const blurb = resolveListingBlurb(bot, "Browse commands, .env, and README.");
  const rating =
    typeof bot.ai_rating === "number" && Number.isFinite(bot.ai_rating)
      ? bot.ai_rating
      : null;

  return (
    <Link
      href={botExplorePath(owner, bot.bot_id)}
      className="flex items-start gap-3 border-b border-border px-4 py-4 last:border-b-0 hover:bg-row-hover"
    >
      <BotPhoto
        photo={bot.photo}
        username={bot.bot_username}
        name={bot.name}
        className="mt-0.5 h-8 w-8 rounded-md border border-border object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-semibold text-accent">{bot.name}</h3>
          {bot.listing_type_label ? <span className="label">{bot.listing_type_label}</span> : null}
        </div>
        <p className="text-sm text-muted">@{botUser}</p>
        <p className="mt-1 line-clamp-2 text-sm text-muted">
          {blurb.fromAi ? <AiBlurbMark className="mr-1.5 align-middle" /> : null}
          {blurb.text}
        </p>
        <AiCatalogMeta
          category={bot.ai_category}
          tags={bot.ai_tags}
          className="mt-2"
          maxTags={4}
        />
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
          {rating != null ? (
            <span className="inline-flex items-center gap-1" title="AI quality rating">
              <Star size={12} />
              {rating.toFixed(1)}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <FileCode2 size={12} />
            {bot.commands_count} commands
          </span>
          <span>Updated {timeAgo(bot.updated_at)}</span>
        </div>
      </div>
    </Link>
  );
}
