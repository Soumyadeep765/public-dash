"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, LogIn, Plus, RefreshCw } from "lucide-react";
import { TbhLogo } from "@/components/TbhLogo";
import { useSessionAccount, useSessionAccounts } from "@/components/SessionProvider";
import { initials } from "@/lib/format";
import {
  activateTelebothostAccount,
  addTelebothostAccount,
  continueWithTelebothost,
  getConsoleSignupUrl,
  switchTelebothostAccount,
  type CurrentAccount,
} from "@/lib/session";

export function LoginClient({
  nextPath,
  isSwitch,
}: {
  nextPath: string;
  isSwitch: boolean;
}) {
  const router = useRouter();
  const account = useSessionAccount();
  const accounts = useSessionAccounts();
  const [busy, setBusy] = useState<"continue" | "switch" | "add" | string | null>(null);

  // After console handoff, leave /login for the intended destination
  useEffect(() => {
    if (!account?.username) return;
    try {
      const pending = sessionStorage.getItem("tbh_login_pending_next");
      if (pending) {
        sessionStorage.removeItem("tbh_login_pending_next");
        router.replace(pending);
      }
    } catch {
      /* ignore */
    }
  }, [account, router]);

  function rememberNext() {
    try {
      sessionStorage.setItem("tbh_login_pending_next", nextPath || "/");
    } catch {
      /* ignore */
    }
  }

  function onContinue() {
    setBusy("continue");
    rememberNext();
    // Hand back to the real destination — avoids nested /login?next=… return URLs
    continueWithTelebothost(nextPath || "/");
  }

  function onSwitch() {
    setBusy("switch");
    rememberNext();
    switchTelebothostAccount(nextPath || "/");
  }

  function onAdd() {
    setBusy("add");
    rememberNext();
    addTelebothostAccount(nextPath || "/");
  }

  function onUseCurrent() {
    router.push(nextPath || "/");
  }

  function onActivate(item: CurrentAccount) {
    setBusy(item.id || item.username);
    rememberNext();
    // Return straight to the destination after handoff (not back through /login)
    const returnTo = nextPath || "/";
    if (item.id || item.userId || item.username) {
      activateTelebothostAccount(item.id || "", returnTo, {
        userId: item.userId,
        username: item.username,
      });
      return;
    }
    switchTelebothostAccount(returnTo);
  }

  const others = accounts.filter((item) => {
    if (!account) return true;
    if (account.id && item.id) return item.id !== account.id;
    if (account.userId && item.userId) return item.userId !== account.userId;
    return item.username !== account.username;
  });

  return (
    <div className="shell flex min-h-[70vh] items-center justify-center py-10">
      <div className="box w-full max-w-md overflow-hidden">
        <div className="border-b border-border bg-canvas-subtle/60 px-5 py-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center text-fg">
            <TbhLogo className="h-10 w-10" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            {isSwitch ? "Switch account" : "Sign in to TeleDevs"}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Optional. Browse freely, or connect your TeleBotHost console account when you want.
          </p>
        </div>

        <div className="space-y-4 px-5 py-5">
          {account?.username ? (
            <div className="rounded-md border border-border bg-canvas-subtle/50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Signed in on TeleDevs
              </p>
              <div className="mt-2 flex items-center gap-3">
                {account.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={account.avatar}
                    alt=""
                    className="h-10 w-10 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="grid h-10 w-10 place-items-center rounded-full border border-border bg-canvas text-sm font-semibold">
                    {initials(account.name || account.username)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold">@{account.username}</p>
                  {account.name ? (
                    <p className="truncate text-sm text-muted">{account.name}</p>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary mt-3 w-full justify-center"
                onClick={onUseCurrent}
              >
                Continue as @{account.username}
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary w-full justify-center !py-2.5"
              disabled={busy !== null}
              onClick={onContinue}
            >
              <LogIn size={16} />
              {busy === "continue" ? "Opening TeleBotHost…" : "Continue with TeleBotHost"}
            </button>
          )}

          {others.length ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Switch account
              </p>
              {others.map((item) => (
                <button
                  key={item.id || item.userId || item.username}
                  type="button"
                  className="btn w-full !justify-start gap-3"
                  disabled={busy !== null}
                  onClick={() => onActivate(item)}
                >
                  {item.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.avatar}
                      alt=""
                      className="h-8 w-8 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <span className="grid h-8 w-8 place-items-center rounded-full border border-border bg-canvas-subtle text-xs font-semibold">
                      {initials(item.name || item.username)}
                    </span>
                  )}
                  <span className="min-w-0 text-left">
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
            className="btn w-full justify-center"
            disabled={busy !== null}
            onClick={onSwitch}
          >
            <RefreshCw size={16} />
            {busy === "switch"
              ? "Opening account picker…"
              : others.length
                ? "More accounts on console"
                : "Choose account on console"}
          </button>

          <button
            type="button"
            className="btn w-full justify-center"
            disabled={busy !== null}
            onClick={onAdd}
          >
            <Plus size={16} />
            {busy === "add" ? "Opening console…" : "Add a different account"}
          </button>

          <p className="text-center text-xs text-muted">
            TeleDevs works signed out. Connect a console account only when you want.
          </p>
        </div>

        <div className="border-t border-border px-5 py-3 text-center text-sm text-muted">
          No account?{" "}
          <a href={getConsoleSignupUrl()} className="link">
            Sign up on TeleBotHost
          </a>
          {" · "}
          <Link href="/" className="link">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
