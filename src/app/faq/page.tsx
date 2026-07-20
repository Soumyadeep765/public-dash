import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { JsonLd } from "@/components/repo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { getConsoleBaseUrl } from "@/lib/session";

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description:
    "Common questions about TeleDevs, publishing bots, privacy, and public profiles.",
  path: "/faq",
});

type Qa = { q: string; a: ReactNode; plain: string };

export default function FaqPage() {
  const items: Qa[] = [
    {
      q: "Is TeleDevs part of TeleBotHost?",
      plain:
        "Yes. TeleDevs is an official TeleBotHost product. It is the public browse layer for bots and developers on the platform. Hosting and editing stay in the console.",
      a: (
        <>
          Yes. TeleDevs is an official TeleBotHost product. It is the public browse layer for bots
          and developers on the platform. Hosting and editing stay in the{" "}
          <a href={getConsoleBaseUrl()} className="link">
            console
          </a>
          .
        </>
      ),
    },
    {
      q: "Do I need to sign in to browse?",
      plain:
        "No. Anyone can open profiles and published bots. Signing in is optional and only adds shortcuts to your own public profile.",
      a: (
        <>
          No. Anyone can open profiles and published bots. Signing in is optional and only adds
          shortcuts to your own public profile.
        </>
      ),
    },
    {
      q: "How do I get my bot on TeleDevs?",
      plain:
        "Publish it from the console as a template or community store listing. Then open TeleDevs or your profile.",
      a: (
        <>
          Publish it from the console as a template or community store listing. Then open{" "}
          <Link href="/explore" className="link">
            community bots
          </Link>{" "}
          or your profile. See{" "}
          <Link href="/how-it-works" className="link">
            How it works
          </Link>
          .
        </>
      ),
    },
    {
      q: "Why do some bot URLs include /b/ and a number?",
      plain:
        "Each published bot has a unique ID. That keeps links stable when more than one listing shares a Telegram username. Username links still work when they resolve cleanly.",
      a: (
        <>
          Each published bot has a unique ID. That keeps links stable when more than one listing
          shares a Telegram username. Username links still work when they resolve cleanly.
        </>
      ),
    },
    {
      q: "Are env secret values visible?",
      plain: "No. TeleDevs shows env names and placeholders only. Values stay in the console.",
      a: <>No. TeleDevs shows env names and placeholders only. Values stay in the console.</>,
    },
  ];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.plain,
      },
    })),
  };

  return (
    <div className="shell max-w-3xl space-y-8">
      <JsonLd data={faqLd} />
      <header className="space-y-3 border-b border-border pb-6">
        <p className="text-sm font-medium text-muted">Help</p>
        <h1 className="text-3xl font-semibold tracking-tight">FAQ</h1>
        <p className="text-base text-muted">
          Straight answers. Need more? Start from{" "}
          <Link href="/about" className="link">
            About
          </Link>{" "}
          or the console.
        </p>
      </header>

      <div className="space-y-3">
        {items.map((item) => (
          <details key={item.q} className="box group">
            <summary className="cursor-pointer list-none px-4 py-3 font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">
                {item.q}
                <span className="text-muted transition group-open:rotate-45">+</span>
              </span>
            </summary>
            <div className="border-t border-border px-4 py-3 text-sm text-muted">{item.a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
