"use client";

import { useState } from "react";
import { GitFork, Loader2 } from "lucide-react";
import { useSessionAccount } from "@/components/SessionProvider";
import { getConsoleForkUrl, getTeledevsLoginPath } from "@/lib/session";

export function ForkBotButton({
  botId,
  listingType,
}: {
  botId: number | string;
  listingType?: string | null;
}) {
  const account = useSessionAccount();
  const [pending, setPending] = useState(false);

  const canFork =
    listingType === "bot_template" ||
    listingType === "community_store" ||
    !listingType;

  if (!canFork) return null;

  function onFork() {
    setPending(true);
    if (account) {
      window.location.href = getConsoleForkUrl(botId);
      return;
    }
    try {
      sessionStorage.setItem("tbh_pending_fork", String(botId));
    } catch {
      /* ignore */
    }
    const here =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "/";
    window.location.href = getTeledevsLoginPath(here);
  }

  return (
    <button
      type="button"
      className="btn btn-sm btn-primary"
      disabled={pending}
      onClick={onFork}
      title={
        account
          ? "Fork this bot into your TeleBotHost account"
          : "Sign in to fork this bot into your account"
      }
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : <GitFork size={14} />}
      {account ? "Fork" : "Sign in to fork"}
    </button>
  );
}
