import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { getConsoleDashboardUrl, getConsoleSignupUrl } from "@/lib/session";
import { getMainSiteUrl } from "@/lib/brand";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Plans & upgrades",
  description:
    "See how TeleBotHost hosting, publishing, and TeleDevs fit together. Upgrade plans in the console.",
  path: "/upgrade",
});

const points = [
  "Host and run Telegram bots without babysitting servers",
  "Publish templates and store listings that show up on TeleDevs",
  "Share stable bot URLs with README, commands, and env placeholders",
  "Keep secrets in the console. TeleDevs only shows what you publish",
];

export default function UpgradePage() {
  const main = getMainSiteUrl();

  return (
    <div className="shell max-w-3xl space-y-8">
      <header className="space-y-3 border-b border-border pb-6">
        <p className="text-sm font-medium text-muted">TeleBotHost</p>
        <h1 className="text-3xl font-semibold tracking-tight">Plans & upgrades</h1>
        <p className="text-base text-muted">
          TeleDevs itself is free to browse. Hosting, limits, and paid tiers live in the
          TeleBotHost console. That is where you upgrade when you need more room to ship.
        </p>
      </header>

      <section className="box space-y-4 p-5">
        <h2 className="text-lg font-semibold">What you get with TeleBotHost</h2>
        <ul className="space-y-2">
          {points.map((point) => (
            <li key={point} className="flex gap-2 text-sm text-muted">
              <Check size={16} className="mt-0.5 shrink-0 text-[var(--success)]" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted">
          TeleDevs is the public branch of that product. Same account. Same bots. Public pages
          for the work you choose to share.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Where to upgrade</h2>
        <p className="text-muted">
          Open the console, check your plan, and pick the tier that matches how many bots and
          resources you need. Pricing and feature gates are managed there, not on TeleDevs.
        </p>
        <p className="text-muted">
          Prefer the marketing site first? Start at{" "}
          <a href={main} className="link" target="_blank" rel="noreferrer">
            telebothost.com
          </a>
          , then jump into the console when you are ready.
        </p>
      </section>

      <section className="box flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold">Continue in the console</h3>
          <p className="text-sm text-muted">Sign up or open your dashboard to review plans.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={getConsoleSignupUrl()} className="btn btn-primary">
            Create account
          </a>
          <a href={getConsoleDashboardUrl()} className="btn">
            Open console
          </a>
          <Link href="/about" className="btn">
            About TeleDevs
          </Link>
        </div>
      </section>
    </div>
  );
}
