"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ExternalLink, LayoutDashboard, LogIn, User } from "lucide-react";
import type { CurrentAccount } from "@/lib/session";
import { initials } from "@/lib/format";

export function UserNav({
  account,
  loginUrl,
  signupUrl,
  consoleUrl,
}: {
  account: CurrentAccount | null;
  loginUrl: string;
  signupUrl: string;
  consoleUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  if (!account) {
    return (
      <div className="flex items-center gap-1.5">
        <a href={loginUrl} className="btn btn-sm hidden sm:inline-flex">
          Sign in
        </a>
        <a href={signupUrl} className="btn btn-sm btn-primary">
          Sign up
        </a>
      </div>
    );
  }

  const label = account.name || account.username;
  const avatarFallback = initials(label);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="btn btn-sm !gap-1.5 !pl-1.5 !pr-2"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {account.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={account.avatar}
            alt=""
            className="h-5 w-5 rounded-full border border-border object-cover"
          />
        ) : (
          <span className="grid h-5 w-5 place-items-center rounded-full bg-canvas-subtle text-[10px] font-semibold">
            {avatarFallback}
          </span>
        )}
        <span className="hidden max-w-[120px] truncate sm:inline">{account.username}</span>
        <ChevronDown size={14} className="text-muted" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1 w-64 overflow-hidden rounded-md border border-border bg-canvas shadow-sm"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="text-xs text-muted">Signed in as</p>
            <p className="truncate text-sm font-semibold">@{account.username}</p>
            {account.email ? (
              <p className="truncate text-xs text-muted">{account.email}</p>
            ) : null}
          </div>
          <div className="py-1 text-sm">
            <Link
              href={`/${account.username}`}
              className="flex items-center gap-2 px-3 py-2 hover:bg-row-hover"
              onClick={() => setOpen(false)}
            >
              <User size={14} />
              Your profile
            </Link>
            <Link
              href={`/${account.username}?tab=bots`}
              className="flex items-center gap-2 px-3 py-2 hover:bg-row-hover"
              onClick={() => setOpen(false)}
            >
              <LayoutDashboard size={14} />
              Your bots
            </Link>
            <a
              href={consoleUrl}
              className="flex items-center gap-2 px-3 py-2 hover:bg-row-hover"
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={14} />
              Open console
            </a>
            <a
              href={loginUrl}
              className="flex items-center gap-2 border-t border-border px-3 py-2 hover:bg-row-hover"
            >
              <LogIn size={14} />
              Switch account
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
