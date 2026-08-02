import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { getConsoleDashboardUrl, getConsoleSignupUrl } from "@/lib/session";

export const metadata: Metadata = pageMetadata({
  title: "How it works",
  description:
    "Learn how TeleBotHost bots move from the console to TeleDevs, including AI catalog summaries from command code.",
  path: "/how-it-works",
});

const steps = [
  {
    n: "1",
    title: "Build in the console",
    body: "Write TBL commands (JavaScript with TeleBotHost built-ins), env placeholders, and your README. That is still the place you edit and run bots.",
  },
  {
    n: "2",
    title: "Publish on purpose",
    body: "Mark a bot as a template or list it in the community store. Unpublished bots never appear on TeleDevs.",
  },
  {
    n: "3",
    title: "AI catalog fills the gaps",
    body: "A background pass reads command code and writes a short description, category, and tags. Your owner or store description still shows first when you provide one. An AI mark appears when the AI summary is what visitors see.",
  },
  {
    n: "4",
    title: "Share a stable link",
    body: "Every published bot gets a canonical URL with its bot ID. Username slugs still work when they are unique for that owner.",
  },
  {
    n: "5",
    title: "People browse the source view",
    body: "Visitors see the file tree, README, .env keys (not secret values), command files, and catalog tags. They can search by name or AI tags, open Telegram, or jump back to your profile.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="shell max-w-3xl space-y-8">
      <header className="space-y-3 border-b border-border pb-6">
        <p className="text-sm font-medium text-muted">Guides</p>
        <h1 className="text-3xl font-semibold tracking-tight">How TeleDevs works</h1>
        <p className="text-base text-muted">
          Short version: you host on TeleBotHost, you choose what goes public, TeleDevs shows it
          in a repo-style layout with optional AI catalog metadata.
        </p>
      </header>

      <ol className="space-y-4">
        {steps.map((step) => (
          <li key={step.n} className="box flex gap-4 p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border bg-canvas-subtle text-sm font-semibold">
              {step.n}
            </span>
            <div>
              <h2 className="font-semibold">{step.title}</h2>
              <p className="mt-1 text-sm text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Browse vs search</h2>
        <p className="text-muted">
          Homepages and template browse lists prefer bots that pass catalog quality checks so the
          main feed stays useful. Search is broader: it can still find published bots by name,
          username, owner description, or AI description and tags.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What stays private</h2>
        <p className="text-muted">
          Env values never appear on TeleDevs. Secrets and account credentials stay in the console.
          Public pages only show what you publish on purpose.
        </p>
      </section>

      <section className="box flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold">Open the console</h3>
          <p className="text-sm text-muted">Publish from the same place you already build bots.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={getConsoleSignupUrl()} className="btn btn-primary">
            Sign up
          </a>
          <a href={getConsoleDashboardUrl()} className="btn">
            Console
          </a>
          <Link href="/upgrade" className="btn">
            Plans & upgrades
          </Link>
        </div>
      </section>
    </div>
  );
}
