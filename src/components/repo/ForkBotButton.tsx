"use client";

import { useState } from "react";
import { GitFork, Loader2 } from "lucide-react";
import { useSessionAccount } from "@/components/SessionProvider";
import { getConsoleForkLoginUrl, getConsoleForkUrl } from "@/lib/session";

export function ForkBotButton({
  botId,
  listingType,
}: {
  botId: number | string;
  listingType?: string | null;
}) {
  const account = useSessionAccount();
  const [pending, setPending] = useState(false);

  // Templates + store listings are forkable via POST /bot/{id}/clone
  const canFork =
    listingType === "bot_template" ||
    listingType === "community_store" ||
    !listingType;

  if (!canFork) return null;

  function onFork() {
    setPending(true);
    const href = account
      ? getConsoleForkUrl(botId)
      : getConsoleForkLoginUrl(botId);
    window.location.href = href;
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
