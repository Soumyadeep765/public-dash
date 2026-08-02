import Link from "next/link";
import { listTemplates } from "@/lib/api";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { TemplateBotCard } from "@/components/TemplateBotCard";

export const metadata: Metadata = pageMetadata({
  title: "Bot templates",
  description:
    "Browse shareable TeleBotHost bot templates with README docs, env placeholders, command source, and AI catalog tags.",
  path: "/templates",
  keywords: ["Telegram bot templates", "bot blueprints", "AI catalog"],
});

export const revalidate = 15;

type SearchParams = Promise<{ q?: string }>;

export default async function TemplatesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = params.q?.trim() || "";

  const data = await listTemplates({ search: q || undefined, limit: 30 }).catch(() => ({
    templates: [],
    pagination: { page: 1, limit: 30, total: 0 },
  }));

  return (
    <div className="shell space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Templates</h1>
        <p className="mt-1 text-muted">
          Shareable bot blueprints with README, source, and AI catalog tags when available.
        </p>
      </div>

      <form className="flex flex-col gap-2 sm:flex-row">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search templates, tags, descriptions…"
          className="input"
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      {!data.templates.length ? (
        <div className="box p-10 text-center">
          <p className="font-semibold">No public templates yet</p>
          <p className="mt-1 text-sm text-muted">Browse the community store meanwhile.</p>
          <div className="mt-4 flex justify-center gap-2">
            <Link href="/explore" className="btn btn-primary">
              Community store
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.templates.map((bot) => (
            <TemplateBotCard key={bot.bot_id} bot={bot} />
          ))}
        </div>
      )}
    </div>
  );
}
