"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Link2, Share2 } from "lucide-react";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function ShareMenu({
  pagePath,
  filePath,
}: {
  /** Site path including leading slash */
  pagePath: string;
  filePath?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function copy(label: string, path: string) {
    const url = `${window.location.origin}${path}`;
    const ok = await copyText(url);
    if (ok) {
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1400);
    }
  }

  function linePermalink() {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    return `${pagePath}${hash || ""}`;
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className="btn btn-sm"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <Share2 size={14} />
        Share
        <ChevronDown size={12} />
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-md border border-border bg-canvas shadow-md">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-row-hover"
            onClick={() => copy("page", pagePath)}
          >
            <Link2 size={14} className="text-muted" />
            {copied === "page" ? "Copied page URL" : "Copy page URL"}
            {copied === "page" ? <Check size={12} className="ml-auto text-[var(--success)]" /> : null}
          </button>
          {filePath ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-row-hover"
              onClick={() => copy("file", pagePath)}
            >
              <Link2 size={14} className="text-muted" />
              {copied === "file" ? "Copied file link" : "Copy file permalink"}
              {copied === "file" ? <Check size={12} className="ml-auto text-[var(--success)]" /> : null}
            </button>
          ) : null}
          {filePath ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-row-hover"
              onClick={() => copy("line", linePermalink())}
            >
              <Link2 size={14} className="text-muted" />
              {copied === "line" ? "Copied line link" : "Copy line permalink"}
              {copied === "line" ? <Check size={12} className="ml-auto text-[var(--success)]" /> : null}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
