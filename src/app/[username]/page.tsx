import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  BadgeCheck,
  CalendarDays,
  FileCode2,
  LayoutTemplate,
  Store,
} from "lucide-react";
import { MarkdownView } from "@/components/MarkdownView";
import { PublishedBotCard } from "@/components/PublishedBotCard";
import { JsonLd } from "@/components/repo/JsonLd";
import { ApiError, getPublicProfile, getPublicUserBots } from "@/lib/api";
import { resolveUsername } from "@/lib/aliases";
import { formatDate, initials } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { socialDisplayValue, socialLabel } from "@/lib/socials";
import { socialIcon } from "@/lib/socialIcons";
import { absoluteUrl } from "@/lib/site";
import { getConsoleSignupUrl } from "@/lib/session";

type Params = Promise<{ username: string }>;

function plainBioPreview(bio: string | null | undefined): string {
  return (bio || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_\-~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { username } = await params;
  const resolved = resolveUsername(username);
  try {
    const user = await getPublicProfile(resolved);
    const title = `${user.profile.name} (@${user.profile.username})`;
    const rawBio = plainBioPreview(user.profile.bio);
    const description =
      rawBio.slice(0, 155) ||
      `${user.profile.name} on TeleDevs. @${user.profile.username} · ${user.stats.published_bots} published bots.`;
    return pageMetadata({
      title,
      description,
      path: `/${user.profile.username}`,
      type: "profile",
      keywords: [
        user.profile.username,
        "TeleBotHost developer",
        "Telegram bot developer",
      ],
      images: user.profile.avatar ? [user.profile.avatar] : undefined,
    });
  } catch {
    return { title: `@${resolved}`, robots: { index: false, follow: true } };
  }
}

export const revalidate = 60;

export default async function ProfilePage({ params }: { params: Params }) {
  const { username: raw } = await params;
  const resolved = resolveUsername(raw);

  let user;
  let botsPayload;
  try {
    [user, botsPayload] = await Promise.all([
      getPublicProfile(resolved),
      getPublicUserBots(resolved, { limit: 50 }),
    ]);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.reason === "user_not_found")) {
      notFound();
    }
    throw error;
  }

  const socials = Array.isArray(user.profile.socials) ? user.profile.socials : [];
  const bots = botsPayload.published_bots;
  const hasBots = bots.length > 0;
  const bio = (user.profile.bio || "").trim();
  const profileUrl = absoluteUrl(`/${user.profile.username}`);

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: user.profile.name,
    alternateName: user.profile.username,
    url: profileUrl,
    image: user.profile.avatar || undefined,
    description: plainBioPreview(bio) || undefined,
    sameAs: socials.map((s) => s.url).filter(Boolean),
    mainEntityOfPage: profileUrl,
  };

  const profilePageLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: profileUrl,
    name: `${user.profile.name} (@${user.profile.username})`,
    mainEntity: {
      "@type": "Person",
      name: user.profile.name,
      alternateName: `@${user.profile.username}`,
    },
  };

  return (
    <div className="shell py-6 sm:py-8">
      <JsonLd data={[personLd, profilePageLd]} />

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
        <aside className="min-w-0">
          <div className="flex items-start gap-4 lg:block">
            {user.profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profile.avatar}
                alt=""
                className="h-20 w-20 shrink-0 rounded-full border border-border object-cover sm:h-24 sm:w-24 lg:h-[260px] lg:w-[260px]"
              />
            ) : (
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-border bg-canvas-subtle text-2xl font-semibold text-muted sm:h-24 sm:w-24 lg:h-[260px] lg:w-[260px] lg:text-5xl">
                {initials(user.profile.name || user.profile.username)}
              </div>
            )}

            <div className="min-w-0 flex-1 pt-0.5 lg:mt-4 lg:pt-0">
              <h1 className="flex flex-wrap items-center gap-1.5 text-2xl font-semibold leading-tight tracking-tight">
                {user.profile.name}
                {user.profile.is_verified ? (
                  <BadgeCheck size={20} className="text-accent" aria-label="Verified" />
                ) : null}
              </h1>
              <p className="text-lg font-light text-muted">@{user.profile.username}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3 lg:mt-3">
            <a
              href={getConsoleSignupUrl()}
              className="btn w-full justify-center"
            >
              Join TeleBotHost
            </a>

            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted">
                <FileCode2 size={16} className="shrink-0" />
                <span>
                  <span className="font-semibold text-fg">{user.stats.published_bots}</span>{" "}
                  published
                </span>
              </li>
              <li className="flex items-center gap-2 text-muted">
                <LayoutTemplate size={16} className="shrink-0" />
                <span>
                  <span className="font-semibold text-fg">{user.stats.bot_templates}</span>{" "}
                  templates
                </span>
              </li>
              <li className="flex items-center gap-2 text-muted">
                <Store size={16} className="shrink-0" />
                <span>
                  <span className="font-semibold text-fg">
                    {user.stats.community_store_listings}
                  </span>{" "}
                  store
                </span>
              </li>
              <li className="flex items-center gap-2 text-muted">
                <CalendarDays size={16} className="shrink-0" />
                <span>Joined {formatDate(user.created_at)}</span>
              </li>
            </ul>

            {socials.length ? (
              <ul className="space-y-2 border-t border-border pt-3">
                {socials.map((social) => (
                  <li key={`${social.type}-${social.url}`}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-2 text-sm text-fg hover:text-accent"
                      title={socialLabel(social.type)}
                    >
                      <span className="text-muted group-hover:text-accent">
                        {socialIcon(social.type)}
                      </span>
                      <span className="min-w-0 truncate">{socialDisplayValue(social)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <section className="box overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-border bg-canvas-subtle/50 px-4 py-2.5">
              <p className="truncate font-mono text-xs text-muted sm:text-sm">
                <span className="text-fg">{user.profile.username}</span>
                <span className="mx-1 text-muted">/</span>
                README.md
              </p>
              <span className="label shrink-0">Overview</span>
            </div>
            {bio ? (
              <MarkdownView content={bio} className="px-4 py-5 sm:px-6" />
            ) : (
              <div className="px-4 py-10 text-center sm:px-6">
                <p className="font-medium text-fg">No README yet</p>
                <p className="mt-1 text-sm text-muted">
                  This developer hasn&apos;t written a public bio.
                </p>
              </div>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-end justify-between gap-3 border-b border-border pb-2">
              <div>
                <h2 className="text-base font-semibold">Published bots</h2>
                <p className="text-xs text-muted">
                  Templates and community store listings from this developer.
                </p>
              </div>
              <span className="label">{bots.length}</span>
            </div>

            <div className="box overflow-hidden">
              {hasBots ? (
                bots.map((bot) => (
                  <PublishedBotCard
                    key={bot.bot_id}
                    bot={bot}
                    username={user.profile.username}
                  />
                ))
              ) : (
                <div className="space-y-2 px-5 py-10 text-center">
                  <p className="font-medium text-fg">No published bots yet</p>
                  <p className="mx-auto max-w-md text-sm text-muted">
                    This profile is public. Bots stay private until the developer publishes a
                    template or store listing.
                  </p>
                  <Link href="/explore" className="btn btn-sm mt-2 inline-flex">
                    Browse community
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
