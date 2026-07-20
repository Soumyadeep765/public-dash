import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  BadgeCheck,
  CalendarDays,
  ExternalLink,
  FileCode2,
  LayoutTemplate,
  Store,
} from "lucide-react";
import { PublishedBotCard } from "@/components/PublishedBotCard";
import { JsonLd } from "@/components/repo/JsonLd";
import { ApiError, getPublicProfile, getPublicUserBots } from "@/lib/api";
import { resolveUsername } from "@/lib/aliases";
import { formatDate, initials } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { socialDisplayValue, socialLabel } from "@/lib/socials";
import { absoluteUrl } from "@/lib/site";
import { getConsoleSignupUrl } from "@/lib/session";

type Params = Promise<{ username: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { username } = await params;
  const resolved = resolveUsername(username);
  try {
    const user = await getPublicProfile(resolved);
    const title = `${user.profile.name} (@${user.profile.username})`;
    const rawBio = (user.profile.bio || "").replace(/\s+/g, " ").trim();
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
  const profileUrl = absoluteUrl(`/${user.profile.username}`);

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: user.profile.name,
    alternateName: user.profile.username,
    url: profileUrl,
    image: user.profile.avatar || undefined,
    description: user.profile.bio || undefined,
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
    <div className="shell space-y-6">
      <JsonLd data={[personLd, profilePageLd]} />
      <section className="box overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-canvas-subtle via-[color-mix(in_srgb,var(--accent)_12%,var(--canvas-subtle))] to-canvas-subtle sm:h-28" />
        <div className="px-4 pb-5 sm:px-6">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            {user.profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profile.avatar}
                alt=""
                className="h-28 w-28 rounded-full border-4 border-canvas object-cover sm:h-32 sm:w-32"
              />
            ) : (
              <div className="grid h-28 w-28 place-items-center rounded-full border-4 border-canvas bg-canvas-subtle text-3xl font-semibold text-muted sm:h-32 sm:w-32">
                {initials(user.profile.name || user.profile.username)}
              </div>
            )}
            <div className="flex flex-wrap gap-2 sm:pb-1">
              <Link href="/explore" className="btn btn-sm">
                Browse bots
              </Link>
              <a href={getConsoleSignupUrl()} className="btn btn-sm btn-primary">
                Join TeleBotHost
              </a>
            </div>
          </div>

          <div className="mt-4 max-w-2xl">
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold leading-tight sm:text-3xl">
              {user.profile.name}
              {user.profile.is_verified ? (
                <BadgeCheck size={20} className="text-accent" aria-label="Verified" />
              ) : null}
            </h1>
            <p className="text-lg text-muted">@{user.profile.username}</p>
            {user.profile.bio ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-fg">
                {user.profile.bio}
              </p>
            ) : (
              <p className="mt-3 text-sm text-muted">No bio yet.</p>
            )}
          </div>

          {socials.length ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {socials.map((social) => (
                <li key={`${social.type}-${social.url}`}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-canvas-subtle px-2.5 py-1.5 text-xs font-medium text-fg hover:border-accent/40 hover:text-accent"
                  >
                    <ExternalLink size={12} className="text-muted" />
                    {socialLabel(social.type)}
                    <span className="text-muted">· {socialDisplayValue(social)}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat
              icon={<FileCode2 size={14} />}
              label="Published"
              value={user.stats.published_bots}
            />
            <Stat
              icon={<LayoutTemplate size={14} />}
              label="Templates"
              value={user.stats.bot_templates}
            />
            <Stat
              icon={<Store size={14} />}
              label="Store"
              value={user.stats.community_store_listings}
            />
            <Stat
              icon={<CalendarDays size={14} />}
              label="Joined"
              value={formatDate(user.created_at)}
              wide
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3 border-b border-border pb-2">
          <div>
            <h2 className="text-base font-semibold">Published bots</h2>
            <p className="text-xs text-muted">
              Only bots marked as templates or store listings appear here.
            </p>
          </div>
          <span className="label">{bots.length}</span>
        </div>

        <div className="box overflow-hidden">
          {hasBots ? (
            bots.map((bot) => (
              <PublishedBotCard key={bot.bot_id} bot={bot} username={user.profile.username} />
            ))
          ) : (
            <div className="space-y-2 px-5 py-10 text-center">
              <p className="font-medium text-fg">No published bots yet</p>
              <p className="mx-auto max-w-md text-sm text-muted">
                This profile is public. Bots stay private until the developer publishes a template
                or store listing.
              </p>
              <a href={getConsoleSignupUrl()} className="btn btn-sm btn-primary mt-2 inline-flex">
                Publish on TeleBotHost
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  wide,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  wide?: boolean;
}) {
  return (
    <div className={`rounded-md border border-border bg-canvas-subtle px-3 py-2 ${wide ? "col-span-2 sm:col-span-1" : ""}`}>
      <p className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold text-fg">{value}</p>
    </div>
  );
}
