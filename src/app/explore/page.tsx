import Link from "next/link";
import { StoreBotCard } from "@/components/StoreBotCard";
import { listStoreBots } from "@/lib/api";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Community bots",
  description:
    "Browse TeleBotHost community store listings. Open public Telegram bots, READMEs, and command source from developers worldwide.",
  path: "/explore",
  keywords: ["Telegram bot store", "community bots", "TeleBotHost store"],
});

export const revalidate = 60;

type SearchParams = Promise<{ q?: string; page?: string }>;

export default async function ExplorePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const page = Math.max(1, Number(params.page || "1") || 1);

  const data = await listStoreBots({ search: q || undefined, page, limit: 24 }).catch(() => ({
    bots: [],
    pagination: { page: 1, limit: 24, total: 0, pages: 0 },
  }));

  return (
    <div className="shell space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Community</h1>
        <p className="mt-1 text-muted">Community store listings from TeleBotHost.</p>
      </div>

      <form className="flex flex-col gap-2 sm:flex-row">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search bots…"
          className="input"
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.bots.map((bot) => (
          <StoreBotCard key={bot._id} bot={bot} />
        ))}
      </div>

      {!data.bots.length ? (
        <div className="box p-8 text-center text-muted">No store bots found.</div>
      ) : null}

      {data.pagination.pages && data.pagination.pages > 1 ? (
        <div className="flex items-center justify-center gap-3 text-sm">
          {page > 1 ? (
            <Link
              href={`/explore?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className="btn btn-sm"
            >
              Previous
            </Link>
          ) : null}
          <span className="text-muted">
            Page {page} of {data.pagination.pages}
          </span>
          {page < (data.pagination.pages || 1) ? (
            <Link
              href={`/explore?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className="btn btn-sm"
            >
              Next
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
