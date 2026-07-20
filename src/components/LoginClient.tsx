"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, LogIn, RefreshCw } from "lucide-react";
import { TbhLogo } from "@/components/TbhLogo";
import { useSessionAccount } from "@/components/SessionProvider";
import { initials } from "@/lib/format";
import {
  continueWithTelebothost,
  getConsoleSignupUrl,
  signOutTeledevs,
  switchTelebothostAccount,
  consumeAccountHandoffFromHash,
  writeCurrentAccountCookie,
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
  const [busy, setBusy] = useState<"continue" | "switch" | null>(null);
  const switchStarted = useRef(false);

  // Menu "Switch account" → /login?switch=1 starts console account picker immediately
  useEffect(() => {
    if (!isSwitch || switchStarted.current) return;
    switchStarted.current = true;
    setBusy("switch");
    signOutTeledevs();
    try {
      sessionStorage.setItem("tbh_login_pending_next", nextPath || "/");
    } catch {
      /* ignore */
    }
    switchTelebothostAccount(`/login?next=${encodeURIComponent(nextPath || "/")}`);
  }, [isSwitch, nextPath]);

  // After Continue/Switch handoff, SessionProvider applies the account — then leave /login
  useEffect(() => {
    if (isSwitch) return;
    try {
      const pending = sessionStorage.getItem("tbh_login_pending_next");
      if (pending && account?.username) {
        sessionStorage.removeItem("tbh_login_pending_next");
        router.replace(pending);
      }
    } catch {
      /* ignore */
    }
  }, [account, router, isSwitch]);

  // If hash handoff lands here before provider finishes, consume it too
  useEffect(() => {
    const handed = consumeAccountHandoffFromHash();
    if (handed?.username) {
      writeCurrentAccountCookie(handed);
      try {
        sessionStorage.setItem("tbh_login_pending_next", nextPath || "/");
      } catch {
        /* ignore */
      }
      router.replace(nextPath || "/");
    }
  }, [nextPath, router]);

  function onContinue() {
    setBusy("continue");
    try {
      sessionStorage.setItem("tbh_login_pending_next", nextPath || "/");
    } catch {
      /* ignore */
    }
    const returnTo = `/login?next=${encodeURIComponent(nextPath || "/")}`;
    continueWithTelebothost(returnTo);
  }

  function onSwitch() {
    setBusy("switch");
    signOutTeledevs();
    try {
      sessionStorage.setItem("tbh_login_pending_next", nextPath || "/");
    } catch {
      /* ignore */
    }
    const returnTo = `/login?next=${encodeURIComponent(nextPath || "/")}`;
    switchTelebothostAccount(returnTo);
  }

  function onUseCurrent() {
    router.push(nextPath || "/");
  }

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
            Use your TeleBotHost console account. Same login — no separate password here.
          </p>
        </div>

        <div className="space-y-4 px-5 py-5">
          {account?.username && !isSwitch ? (
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
          ) : null}

          <button
            type="button"
            className="btn btn-primary w-full justify-center !py-2.5"
            disabled={busy !== null}
            onClick={onContinue}
          >
            <LogIn size={16} />
            {busy === "continue" ? "Opening TeleBotHost…" : "Continue with TeleBotHost"}
          </button>

          <button
            type="button"
            className="btn w-full justify-center"
            disabled={busy !== null}
            onClick={onSwitch}
          >
            <RefreshCw size={16} />
            {busy === "switch" ? "Opening account switch…" : "Use a different account"}
          </button>

          <p className="text-center text-xs text-muted">
            You&apos;ll open the TeleBotHost console to confirm, then return here.
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
