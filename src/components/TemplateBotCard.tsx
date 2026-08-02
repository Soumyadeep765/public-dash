import Link from "next/link";
import { FileCode2 } from "lucide-react";
import type { PublishedBotSummary } from "@/lib/types";
import { cleanBotUsername, timeAgo } from "@/lib/format";
import { botExplorePath } from "@/lib/repo";
import { resolveListingBlurb, formatAiCategory, cleanAiTags } from "@/lib/botCopy";
import { BotPhoto } from "@/components/BotPhoto";
import { AiBlurbMark } from "@/components/AiBlurbMark";

export function TemplateBotCard({ bot }: { bot: PublishedBotSummary }) {
  const owner = bot.owner_username;
  const username = cleanBotUsername(bot.bot_username);
  const href = botExplorePath(owner || "unknown", bot.bot_id);
  const blurb = resolveListingBlurb(bot, "Open to browse template source.");
  const category = formatAiCategory(bot.ai_category);
  const tags = cleanAiTags(bot.ai_tags, 4);

  return (
    <article className="box flex h-full flex-col">
      <Link href={href} className="flex flex-1 flex-col p-4 hover:bg-row-hover">
        <div className="flex gap-3">
          <BotPhoto
            photo={bot.photo}
            username={bot.bot_username}
            name={bot.name}
            className="h-10 w-10 rounded-md border border-border object-cover"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-accent hover:underline">{bot.name}</h3>
            <p className="truncate text-sm text-muted">@{username}</p>
          </div>
        </div>
        <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted">
          {blurb.fromAi ? <AiBlurbMark className="mr-1.5 align-middle" /> : null}
          {blurb.text}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="label">Template</span>
          {category ? <span className="label">{category}</span> : null}
          {tags.map((tag) => (
            <span key={tag} className="label">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <FileCode2 size={12} />
            {bot.commands_count} commands
          </span>
          <span>Updated {timeAgo(bot.updated_at)}</span>
        </div>
      </Link>
      {owner ? (
        <div className="border-t border-border px-4 py-2 text-xs text-muted">
          by{" "}
          <Link href={`/${owner}`} className="link font-medium">
            @{owner}
          </Link>
        </div>
      ) : null}
    </article>
  );
}
