"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Plus,
  RefreshCw,
  User,
} from "lucide-react";
import type { CurrentAccount } from "@/lib/session";
import { initials } from "@/lib/format";
import {
  activateTelebothostAccount,
  addTelebothostAccount,
  signOutTeledevs,
  switchTelebothostAccount,
} from "@/lib/session";
import { useSessionAccounts } from "@/components/SessionProvider";

function AccountAvatar({
  account,
  className = "h-5 w-5",
}: {
  account: CurrentAccount;
  className?: string;
}) {
  const label = account.name || account.username;
  if (account.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={account.avatar}
        alt=""
        className={`${className} rounded-full border border-border object-cover`}
      />
    );
  }
  return (
    <span
      className={`${className} grid place-items-center rounded-full bg-canvas-subtle text-[10px] font-semibold`}
    >
      {initials(label)}
    </span>
  );
}

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
  const accounts = useSessionAccounts();
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
        <Link href={loginUrl} className="btn btn-sm hidden sm:inline-flex">
          Sign in
        </Link>
        <a href={signupUrl} className="btn btn-sm btn-primary">
          Sign up
        </a>
      </div>
    );
  }

  const others = accounts.filter((item) => {
    if (account.id && item.id) return item.id !== account.id;
    if (account.userId && item.userId) return item.userId !== account.userId;
    return item.username !== account.username;
  });

  function onSignOut() {
    signOutTeledevs();
    window.location.href = "/";
  }

  function onActivate(item: CurrentAccount) {
    setOpen(false);
    const id = item.id;
    if (id) {
      activateTelebothostAccount(id, window.location.pathname + window.location.search);
      return;
    }
    // No id available — open console picker
    switchTelebothostAccount(window.location.pathname + window.location.search);
  }

  function onPickOther() {
    setOpen(false);
    switchTelebothostAccount(window.location.pathname + window.location.search);
  }

  function onAddAccount() {
    setOpen(false);
    addTelebothostAccount(window.location.pathname + window.location.search);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="btn btn-sm !gap-1.5 !pl-1.5 !pr-2"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <AccountAvatar account={account} />
        <span className="hidden max-w-[120px] truncate sm:inline">{account.username}</span>
        <ChevronDown size={14} className="text-muted" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1 w-72 overflow-hidden rounded-md border border-border bg-canvas shadow-sm"
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

            {others.length ? (
              <div className="border-t border-border pt-1">
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Switch account
                </p>
                {others.map((item) => (
                  <button
                    key={item.id || item.userId || item.username}
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-row-hover"
                    onClick={() => onActivate(item)}
                  >
                    <AccountAvatar account={item} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">@{item.username}</span>
                      {item.name ? (
                        <span className="block truncate text-xs text-muted">{item.name}</span>
                      ) : null}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left hover:bg-row-hover"
              onClick={onPickOther}
            >
              <RefreshCw size={14} />
              {others.length ? "More on console" : "Switch account"}
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-row-hover"
              onClick={onAddAccount}
            >
              <Plus size={14} />
              Add another account
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-row-hover"
              onClick={onSignOut}
            >
              <LogOut size={14} />
              Sign out on TeleDevs
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
