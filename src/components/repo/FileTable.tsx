"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileCode2, FileText, Folder, KeyRound, Search } from "lucide-react";
import type { RepoFileNode } from "@/lib/types";
import { repoBlobUrl, repoTreeUrl } from "@/lib/repo";
import { timeAgo } from "@/lib/format";

function iconFor(node: RepoFileNode) {
  if (node.kind === "folder") return <Folder size={16} className="text-attention" />;
  if (node.kind === "env") return <KeyRound size={16} className="text-muted" />;
  if (node.kind === "readme") return <FileText size={16} className="text-muted" />;
  return <FileCode2 size={16} className="text-muted" />;
}

/** GitHub-style file/folder table — every row is a shareable URL. */
export function FileTable({
  basePath,
  entries,
  updatedAt,
  searchable = false,
}: {
  basePath: string;
  entries: RepoFileNode[];
  updatedAt?: string;
  searchable?: boolean;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return entries;
    return entries.filter((entry) => {
      return (
        entry.name.toLowerCase().includes(needle) ||
        entry.path.toLowerCase().includes(needle)
      );
    });
  }, [entries, q]);

  return (
    <div className="box overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-border bg-canvas-subtle px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-muted">
          Source · {filtered.length}
          {q.trim() ? ` of ${entries.length}` : ""} items
        </span>
        {searchable ? (
          <label className="relative block w-full sm:max-w-[220px]">
            <Search
              size={13}
              className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Go to file"
              className="w-full rounded-md border border-border bg-canvas py-1 pl-7 pr-2 text-xs text-fg outline-none focus:border-accent"
            />
          </label>
        ) : null}
      </div>
      <ul className="divide-y divide-border">
        {filtered.map((entry) => {
          const href =
            entry.kind === "folder"
              ? repoTreeUrl(basePath, entry.path)
              : repoBlobUrl(basePath, entry.path);

          return (
            <li key={entry.id}>
              <Link
                href={href}
                className="grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-2.5 hover:bg-row-hover sm:grid-cols-[minmax(0,1fr)_140px]"
              >
                <span className="flex min-w-0 items-center gap-2">
                  {iconFor(entry)}
                  <span
                    className={
                      entry.kind === "folder"
                        ? "truncate font-medium text-accent"
                        : "truncate font-mono text-[13px] text-accent"
                    }
                  >
                    {entry.name}
                    {entry.kind === "folder" ? "/" : ""}
                  </span>
                </span>
                <span className="hidden text-right text-xs text-muted sm:block">
                  {updatedAt ? timeAgo(updatedAt) : "—"}
                </span>
              </Link>
            </li>
          );
        })}
        {!filtered.length ? (
          <li className="px-3 py-8 text-center text-sm text-muted">
            {q.trim() ? "No matching files." : "This folder is empty."}
          </li>
        ) : null}
      </ul>
    </div>
  );
}
