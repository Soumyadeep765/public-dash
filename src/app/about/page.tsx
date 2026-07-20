import type { Metadata } from "next";
import Link from "next/link";
import { AffiliationNote } from "@/components/AffiliationNote";
import { getMainSiteUrl, DOCS_API_URL } from "@/lib/brand";
import { pageMetadata } from "@/lib/seo";
import { getConsoleBaseUrl, getConsoleSignupUrl } from "@/lib/session";

export const metadata: Metadata = pageMetadata({
  title: "About TeleDevs",
  description:
    "Learn what TeleDevs is, how it connects to the TeleBotHost console, and how public bot profiles work.",
  path: "/about",
});

export default function AboutPage() {
  const main = getMainSiteUrl();

  return (
    <div className="shell max-w-3xl space-y-8">
      <header className="space-y-3 border-b border-border pb-6">
        <p className="text-sm font-medium text-muted">TeleBotHost · TeleDevs</p>
        <h1 className="text-3xl font-semibold tracking-tight">About TeleDevs</h1>
        <p className="text-base text-muted">
          TeleDevs is the public side of TeleBotHost. You browse developer profiles, published
          bots, READMEs, and command source the way you would browse a code repo. Hosting and
          editing still happen in the console.
        </p>
        <AffiliationNote />
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Why this exists</h2>
        <p className="text-muted">
          A lot of Telegram bots never leave a private dashboard. TeleDevs gives you a shareable
          page for work you already publish on TeleBotHost. Someone can open your bot, read the
          docs, peek at commands, and decide if they want to use or fork it.
        </p>
        <p className="text-muted">
          We keep the layout familiar on purpose. File trees, blob URLs, and line links make it
          easy to point a teammate at the exact file you mean.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Official TeleBotHost product</h2>
        <p className="text-muted">
          TeleDevs is not a third-party mirror. Listings you publish as templates or store bots
          show up here. Private bots stay private.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-muted">
          <li>
            TeleDevs:{" "}
            <a href="https://teledevs.me" className="link">
              teledevs.me
            </a>
          </li>
          <li>
            Main site:{" "}
            <a href={main} className="link" target="_blank" rel="noreferrer">
              {main.replace(/^https?:\/\//, "")}
            </a>
          </li>
          <li>
            Console:{" "}
            <a href={getConsoleBaseUrl()} className="link" target="_blank" rel="noreferrer">
              console.telebothost.com
            </a>
          </li>
          <li>
            Public API docs:{" "}
            <a href={DOCS_API_URL} className="link" target="_blank" rel="noreferrer">
              api.telebothost.com
            </a>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What you can do here</h2>
        <p className="text-muted">
          Browse the store, open a developer profile, share a bot URL, or copy a permalink to a
          line of command code. Signing in is optional.
        </p>
      </section>

      <section className="box flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold">Ready to publish?</h3>
          <p className="text-sm text-muted">
            Create a TeleBotHost account, ship a bot, then list it as a template or store entry.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={getConsoleSignupUrl()} className="btn btn-primary">
            Get started
          </a>
          <Link href="/how-it-works" className="btn">
            How it works
          </Link>
        </div>
      </section>
    </div>
  );
}
