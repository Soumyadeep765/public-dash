"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSessionAccount } from "@/components/SessionProvider";
import { getConsoleDashboardUrl } from "@/lib/session";

type BotSummary = {
  bot_id: number;
  name: string;
  photo: string;
  bot_username: string;
  owner_username: string | null;
  listing_type_label: string | null;
  description: string;
  commands_count: number;
  updated_at: string;
};

export function HomeSignedInBanner() {
  const account = useSessionAccount();
  const [bots, setBots] = useState<BotSummary[] | null>(null);

  useEffect(() => {
    if (!account?.username) {
      setBots(null);
      return;
    }

    const base =
      process.env.NEXT_PUBLIC_TBH_API_BASE?.replace(/\/$/, "") ||
      "https://api.telebothost.com/api/v1";

    fetch(`${base}/public/user/${encodeURIComponent(account.username)}/bots?limit=6`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.published_bots) setBots(data.published_bots);
        else setBots([]);
      })
      .catch(() => setBots([]));
  }, [account?.username]);

  if (!account) return null;

  return (
    <section className="mb-8 space-y-4 border-b border-border pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {account.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={account.avatar}
              alt=""
              className="h-10 w-10 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="grid h-10 w-10 place-items-center rounded-full border border-border bg-canvas-subtle text-xs font-semibold">
              {(account.name || account.username).slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold">Signed in as @{account.username}</p>
            <p className="text-sm text-muted">Optional — TeleDevs works the same when signed out.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/${account.username}`} className="btn btn-sm btn-primary">
            Your profile
          </Link>
          <a href={getConsoleDashboardUrl()} className="btn btn-sm" target="_blank" rel="noreferrer">
            Console
          </a>
        </div>
      </div>

      {bots && bots.length > 0 ? (
        <div className="box divide-y divide-border overflow-hidden">
          {bots.map((bot) => (
            <Link
              key={bot.bot_id}
              href={`/${account.username}/b/${bot.bot_id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-row-hover"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bot.photo || "/bot-fallback.svg"}
                alt=""
                className="h-8 w-8 rounded-md border border-border object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-accent">{bot.name}</p>
                <p className="truncate text-xs text-muted">
                  @{bot.bot_username.replace(/^@/, "")} · {bot.commands_count} commands
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
