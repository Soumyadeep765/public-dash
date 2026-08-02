import Link from "next/link";
import { Download, Star } from "lucide-react";
import type { StoreBot } from "@/lib/types";
import { cleanBotUsername, formatNumber } from "@/lib/format";
import { botExplorePath } from "@/lib/repo";
import { cleanAiTags } from "@/lib/botCopy";
import { BotPhoto } from "@/components/BotPhoto";

export function StoreBotCard({ bot }: { bot: StoreBot }) {
  const owner = bot.owner_username;
  const username = cleanBotUsername(bot.username);
  const href =
    owner && bot.bot_id
      ? botExplorePath(owner, bot.bot_id)
      : owner
        ? `/${owner}/${username}`
        : `/store/${bot._id}`;
  const tags = cleanAiTags(bot.tags, 4);

  return (
    <article className="box flex h-full flex-col">
      <Link href={href} className="flex flex-1 flex-col p-4 hover:bg-row-hover">
        <div className="flex gap-3">
          <BotPhoto
            photo={bot.image}
            username={bot.username}
            name={bot.name}
            className="h-10 w-10 rounded-md border border-border object-cover"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-accent hover:underline">{bot.name}</h3>
            <p className="truncate text-sm text-muted">@{username}</p>
          </div>
        </div>
        <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted">
          {bot.description || "No description yet."}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="label">{bot.category || "General"}</span>
          {tags.map((tag) => (
            <span key={tag} className="label">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Star size={12} />
            {bot.rating?.toFixed?.(1) ?? "—"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Download size={12} />
            {formatNumber(bot.install_count)}
          </span>
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
