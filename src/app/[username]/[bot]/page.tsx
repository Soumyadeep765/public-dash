import Link from "next/link";
import { permanentRedirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { FileCode2 } from "lucide-react";
import { botExplorePath, resolveRepoSlug } from "@/lib/repo";
import { timeAgo } from "@/lib/format";
import { absoluteUrl } from "@/lib/site";
import { BotPhoto } from "@/components/BotPhoto";

type Params = Promise<{ username: string; bot: string }>;

export const revalidate = 15;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { username, bot } = await params;
  const resolved = await resolveRepoSlug(username, bot);

  if (resolved.kind === "unique") {
    return {
      title: `${resolved.repo.owner}/${resolved.repo.handle}`,
      alternates: { canonical: absoluteUrl(resolved.repo.basePath) },
      robots: { index: false, follow: true },
    };
  }

  if (resolved.kind === "ambiguous") {
    return {
      title: `Choose bot · @${resolved.botUsername}`,
      description: `Multiple published bots share @${resolved.botUsername} for @${resolved.owner}.`,
      robots: { index: false, follow: true },
    };
  }

  return { title: `@${bot}` };
}

export default async function BotSlugResolvePage({ params }: { params: Params }) {
  const { username, bot: rawBot } = await params;

  // Reserved static segment used by /{owner}/b/{botId}
  if (rawBot === "b") notFound();

  const resolved = await resolveRepoSlug(username, rawBot);

  if (resolved.kind === "unique") {
    permanentRedirect(resolved.repo.basePath);
  }

  if (resolved.kind === "missing") {
    notFound();
  }

  const { owner, botUsername, bots } = resolved;

  return (
    <div className="shell space-y-6">
      <header className="space-y-2 border-b border-border pb-4">
        <p className="text-sm text-muted">
          <Link href={`/${owner}`} className="text-accent hover:underline">
            @{owner}
          </Link>
        </p>
        <h1 className="text-2xl font-semibold">Multiple bots named @{botUsername}</h1>
        <p className="max-w-2xl text-sm text-muted">
          This Telegram username is shared by more than one published bot. Pick the
          listing you want — each has a unique ID URL.
        </p>
      </header>

      <div className="box overflow-hidden">
        {bots.map((item) => (
          <Link
            key={item.bot_id}
            href={botExplorePath(item.owner_username || owner, item.bot_id)}
            className="flex items-start gap-3 border-b border-border px-4 py-4 last:border-b-0 hover:bg-row-hover"
          >
            <BotPhoto
              photo={item.photo}
              username={item.bot_username}
              name={item.name}
              className="mt-0.5 h-8 w-8 rounded-md border border-border object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate font-semibold text-accent">{item.name}</h2>
                {item.listing_type_label ? (
                  <span className="label">{item.listing_type_label}</span>
                ) : null}
              </div>
              <p className="text-sm text-muted">
                ID {item.bot_id} · @{botUsername}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-muted">
                {item.description || "Open to browse source."}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
                <span className="inline-flex items-center gap-1">
                  <FileCode2 size={12} />
                  {item.commands_count} commands
                </span>
                <span>Updated {timeAgo(item.updated_at)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
