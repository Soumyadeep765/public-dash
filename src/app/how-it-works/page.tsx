import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { getConsoleDashboardUrl, getConsoleSignupUrl } from "@/lib/session";

export const metadata: Metadata = pageMetadata({
  title: "How it works",
  description:
    "Learn how TeleBotHost bots move from the console to a public Explore page with README, commands, and shareable links.",
  path: "/how-it-works",
});

const steps = [
  {
    n: "1",
    title: "Build in the console",
    body: "Write commands, env placeholders, and your README in TeleBotHost. That is still the place you edit and run bots.",
  },
  {
    n: "2",
    title: "Publish on purpose",
    body: "Mark a bot as a template or list it in the community store. Unpublished bots never appear on Explore.",
  },
  {
    n: "3",
    title: "Share a stable link",
    body: "Every published bot gets a canonical URL with its bot ID. Username slugs still work when they are unique for that owner.",
  },
  {
    n: "4",
    title: "People browse the source view",
    body: "Visitors see the file tree, README, .env keys (not secret values), and command files. They can open Telegram or jump back to your profile.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="shell max-w-3xl space-y-8">
      <header className="space-y-3 border-b border-border pb-6">
        <p className="text-sm font-medium text-muted">Guides</p>
        <h1 className="text-3xl font-semibold tracking-tight">How Explore works</h1>
        <p className="text-base text-muted">
          Short version: you host on TeleBotHost, you choose what goes public, Explore shows it
          in a repo-style layout.
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
        <h2 className="text-xl font-semibold">What stays private</h2>
        <p className="text-muted">
          Env values never appear on Explore. Secrets and account credentials stay in the console.
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
