"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { highlightCode } from "@/lib/highlight";

function parseLineHash(hash: string): { start: number; end: number } | null {
  const match = hash.match(/^#L(\d+)(?:-L(\d+))?$/i);
  if (!match) return null;
  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : start;
  if (!start || start < 1) return null;
  return { start, end: Math.max(start, end) };
}

export function BlobCode({
  content,
  language,
  fileName,
  blobPath,
}: {
  content: string;
  language?: string;
  fileName: string;
  /** Absolute path on this site, e.g. /user/bot/blob/commands/x.js */
  blobPath: string;
}) {
  const [copied, setCopied] = useState(false);
  const [range, setRange] = useState<{ start: number; end: number } | null>(null);

  const lines = useMemo(() => content.replace(/\n$/, "").split("\n"), [content]);
  const highlightedLines = useMemo(
    () => highlightCode(content.replace(/\n$/, ""), language).split("\n"),
    [content, language]
  );

  useEffect(() => {
    function sync() {
      const parsed = parseLineHash(window.location.hash);
      setRange(parsed);
      if (parsed) {
        const el = document.getElementById(`L${parsed.start}`);
        el?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  }

  function selectLine(line: number, event: MouseEvent) {
    event.preventDefault();
    let next = `#L${line}`;
    if (event.shiftKey && range) {
      const start = Math.min(range.start, line);
      const end = Math.max(range.start, line);
      next = start === end ? `#L${start}` : `#L${start}-L${end}`;
    }
    window.history.replaceState(null, "", `${blobPath}${next}`);
    setRange(parseLineHash(next));
  }

  return (
    <div className="box overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-canvas-subtle px-3 py-2">
        <div className="min-w-0">
          <p className="truncate font-mono text-xs text-fg">{fileName}</p>
          <p className="text-xs text-muted">
            {language || "text"} · {lines.length} lines
          </p>
        </div>
        <div className="flex gap-1.5">
          <a
            href={blobPath.replace("/blob/", "/raw/")}
            className="btn btn-sm"
          >
            Raw
          </a>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              const url = `${window.location.origin}${blobPath}${window.location.hash}`;
              navigator.clipboard.writeText(url).catch(() => undefined);
            }}
            title="Copy permalink"
          >
            <Link2 size={12} />
            Permalink
          </button>
          <button type="button" onClick={copy} className="btn btn-sm">
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <pre className="code-scroll hljs-code max-h-[min(75vh,860px)] overflow-auto p-0 text-[12px] leading-5">
        <code className="grid min-w-full grid-cols-[auto_1fr] font-mono">
          {lines.map((line, index) => {
            const n = index + 1;
            const active = range && n >= range.start && n <= range.end;
            return (
              <span key={n} id={`L${n}`} className="contents">
                <a
                  href={`${blobPath}#L${n}`}
                  onClick={(e) => selectLine(n, e)}
                  className={`select-none border-r border-border px-3 py-0 text-right text-subtle hover:text-accent ${
                    active ? "bg-[color-mix(in_srgb,var(--accent)_18%,transparent)]" : ""
                  }`}
                  aria-label={`Line ${n}`}
                >
                  {n}
                </a>
                <span
                  className={`whitespace-pre px-4 py-0 ${
                    active ? "bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]" : ""
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: highlightedLines[index] || " ",
                  }}
                />
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
