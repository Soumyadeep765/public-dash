"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import { BookMarked, Search, User } from "lucide-react";
import { API_BASE } from "@/lib/api";
import { botExplorePath } from "@/lib/repo";
import type { SearchBotHit, SearchUserHit } from "@/lib/types";

type SuggestState = {
  users: SearchUserHit[];
  bots: SearchBotHit[];
};

export function HeaderSearch() {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggest, setSuggest] = useState<SuggestState>({ users: [], bots: [] });
  const [, startTransition] = useTransition();

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    const q = query.trim().replace(/^@/, "");
    if (q.length < 2) {
      setSuggest({ users: [], bots: [] });
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q, limit: "5", type: "all" });
        const res = await fetch(`${API_BASE}/public/search?${params}`, {
          signal: controller.signal,
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as SuggestState;
        setSuggest({
          users: Array.isArray(data.users) ? data.users.slice(0, 5) : [],
          bots: Array.isArray(data.bots) ? data.bots.slice(0, 5) : [],
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setSuggest({ users: [], bots: [] });
        }
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  function goSearch(value: string) {
    const q = value.trim().replace(/^@/, "");
    setOpen(false);
    startTransition(() => {
      if (!q) {
        router.push("/search");
        return;
      }
      if (q.includes("/")) {
        const [user, bot] = q.split("/");
        router.push(`/${encodeURIComponent(user)}/${encodeURIComponent(bot)}`);
        return;
      }
      router.push(`/search?q=${encodeURIComponent(q)}`);
    });
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    goSearch(query);
  }

  const showPanel = open && query.trim().length >= 1;
  const hasHits = suggest.users.length > 0 || suggest.bots.length > 0;

  return (
    <div ref={rootRef} className="relative w-full max-w-[340px] flex-1">
      <form onSubmit={onSubmit} role="search">
        <label className="sr-only" htmlFor={listId}>
          Search developers and bots
        </label>
        <div
          className={`flex h-8 items-center gap-2 rounded-md border bg-canvas px-2.5 transition-shadow ${
            open
              ? "border-accent shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_28%,transparent)]"
              : "border-border"
          }`}
        >
          <Search size={14} className="shrink-0 text-muted" aria-hidden />
          <input
            id={listId}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                (e.target as HTMLInputElement).blur();
              }
            }}
            placeholder="Search developers, bots…"
            className="h-full w-full min-w-0 bg-transparent text-[13px] text-fg outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
            autoComplete="off"
            aria-expanded={showPanel}
            aria-controls={`${listId}-panel`}
            aria-autocomplete="list"
          />
          <kbd className="hidden shrink-0 rounded border border-border bg-canvas-subtle px-1.5 py-0.5 font-mono text-[10px] text-muted sm:inline">
            /
          </kbd>
        </div>
      </form>

      {showPanel ? (
        <div
          id={`${listId}-panel`}
          className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-md border border-accent bg-canvas shadow-lg"
          role="listbox"
        >
          {query.trim().length < 2 ? (
            <p className="px-3 py-3 text-xs text-muted">Type at least 2 characters to search.</p>
          ) : loading && !hasHits ? (
            <p className="px-3 py-3 text-xs text-muted">Searching…</p>
          ) : !hasHits ? (
            <button
              type="button"
              className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-row-hover"
              onClick={() => goSearch(query)}
            >
              <span>
                Search for <span className="font-semibold text-fg">{query.trim()}</span>
              </span>
              <span className="text-xs text-muted">Jump to</span>
            </button>
          ) : (
            <div className="max-h-[min(70vh,420px)] overflow-y-auto py-1">
              {suggest.users.length ? (
                <section>
                  <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                    Developers
                  </p>
                  {suggest.users.map((user) => (
                    <Link
                      key={user.id || user.username}
                      href={`/${user.username}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-row-hover"
                      onClick={() => setOpen(false)}
                      role="option"
                    >
                      <User size={14} className="shrink-0 text-muted" />
                      <span className="min-w-0 flex-1 truncate font-medium text-fg">
                        @{user.username}
                      </span>
                      <span className="shrink-0 text-xs text-muted">Jump to</span>
                    </Link>
                  ))}
                </section>
              ) : null}

              {suggest.bots.length ? (
                <section>
                  <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                    Bots
                  </p>
                  {suggest.bots.map((bot) => {
                    const owner = bot.owner_username || "unknown";
                    const href = botExplorePath(owner, bot.bot_id);
                    const handle = (bot.bot_username || "").replace(/^@/, "");
                    return (
                      <Link
                        key={`${bot.bot_id}-${handle}`}
                        href={href}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-row-hover"
                        onClick={() => setOpen(false)}
                        role="option"
                      >
                        <BookMarked size={14} className="shrink-0 text-muted" />
                        <span className="min-w-0 flex-1 truncate font-medium text-fg">
                          {owner}/{handle || bot.name}
                        </span>
                        <span className="shrink-0 text-xs text-muted">Jump to</span>
                      </Link>
                    );
                  })}
                </section>
              ) : null}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs">
            <Link
              href={`/search?q=${encodeURIComponent(query.trim())}`}
              className="text-accent hover:underline"
              onClick={() => setOpen(false)}
            >
              View all results
            </Link>
            <Link href="/about" className="text-accent hover:underline" onClick={() => setOpen(false)}>
              About TeleDevs
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
