import Link from "next/link";
import type { PublishedBotSummary } from "@/lib/types";
import { botExplorePath } from "@/lib/repo";
import { cleanBotUsername } from "@/lib/format";

export function RelatedBots({
  bots,
  owner,
}: {
  bots: PublishedBotSummary[];
  owner: string;
}) {
  if (!bots.length) return null;

  return (
    <section className="box overflow-hidden">
      <div className="border-b border-border bg-canvas-subtle px-3 py-2">
        <h2 className="text-sm font-semibold">More from @{owner}</h2>
      </div>
      <ul className="divide-y divide-border">
        {bots.map((bot) => {
          const handle = cleanBotUsername(bot.bot_username);
          return (
            <li key={bot.bot_id}>
              <Link
                href={botExplorePath(bot.owner_username || owner, bot.bot_id)}
                className="flex items-center gap-2 px-3 py-2.5 hover:bg-row-hover"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bot.photo || "/bot-fallback.svg"}
                  alt=""
                  className="h-7 w-7 rounded-md border border-border object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-accent">{bot.name}</p>
                  <p className="truncate text-xs text-muted">@{handle}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
