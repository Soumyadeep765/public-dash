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
  const desktopRootRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggest, setSuggest] = useState<SuggestState>({ users: [], bots: [] });
  const [, startTransition] = useTransition();

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!desktopRootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    function onOpenSearch() {
      if (window.matchMedia("(max-width: 767px)").matches) {
        setMobileOpen(true);
        return;
      }
      desktopInputRef.current?.focus();
      setOpen(true);
    }
    window.addEventListener("tbh-open-search", onOpenSearch);
    return () => window.removeEventListener("tbh-open-search", onOpenSearch);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => mobileInputRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [mobileOpen]);

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

  function closeAll() {
    setOpen(false);
    setMobileOpen(false);
  }

  function goSearch(value: string) {
    const q = value.trim().replace(/^@/, "");
    closeAll();
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

  const suggestBody = (
    <>
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
        <div className="py-1">
          {suggest.users.length ? (
            <section>
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                Developers
              </p>
              {suggest.users.map((user) => (
                <Link
                  key={user.id || user.username}
                  href={`/${user.username}`}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-row-hover"
                  onClick={closeAll}
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
                    className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-row-hover"
                    onClick={closeAll}
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
          onClick={closeAll}
        >
          View all results
        </Link>
        <Link href="/about" className="text-accent hover:underline" onClick={closeAll}>
          About TeleDevs
        </Link>
      </div>
    </>
  );

  return (
    <>
      <div ref={desktopRootRef} className="relative hidden w-full max-w-[340px] flex-1 md:block">
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
              ref={desktopInputRef}
              id={listId}
              data-header-search-desktop
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
            <kbd className="hidden shrink-0 rounded border border-border bg-canvas-subtle px-1.5 py-0.5 font-mono text-[10px] text-muted lg:inline">
              /
            </kbd>
          </div>
        </form>

        {showPanel ? (
          <div
            id={`${listId}-panel`}
            className="absolute left-0 right-0 z-50 mt-1 max-h-[min(70vh,420px)] overflow-y-auto rounded-md border border-accent bg-canvas shadow-lg"
            role="listbox"
          >
            {suggestBody}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-btn-hover hover:text-fg md:hidden"
        aria-label="Search"
        onClick={() => setMobileOpen(true)}
      >
        <Search size={18} />
      </button>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] flex flex-col bg-canvas md:hidden">
          <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
            <form onSubmit={onSubmit} role="search" className="min-w-0 flex-1">
              <div className="flex h-9 items-center gap-2 rounded-md border border-accent bg-canvas-subtle px-2.5 shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_22%,transparent)]">
                <Search size={16} className="shrink-0 text-muted" aria-hidden />
                <input
                  ref={mobileInputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setMobileOpen(false);
                  }}
                  placeholder="Search developers, bots…"
                  className="h-full w-full min-w-0 bg-transparent text-sm text-fg outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
                  autoComplete="off"
                  aria-label="Search developers and bots"
                />
              </div>
            </form>
            <button
              type="button"
              className="shrink-0 rounded-md px-2 py-1.5 text-sm font-medium text-accent hover:bg-btn-hover"
              onClick={() => setMobileOpen(false)}
            >
              Cancel
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{suggestBody}</div>
        </div>
      ) : null}
    </>
  );
}
