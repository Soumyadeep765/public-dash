"use client";

import { useEffect } from "react";
import { useSessionAccount } from "@/components/SessionProvider";
import { getConsoleForkUrl } from "@/lib/session";

/** After TeleDevs login, resume a pending fork into the console. */
export function PendingForkRedirect() {
  const account = useSessionAccount();

  useEffect(() => {
    if (!account?.username) return;
    try {
      const botId = sessionStorage.getItem("tbh_pending_fork");
      if (!botId || !/^\d+$/.test(botId)) return;
      sessionStorage.removeItem("tbh_pending_fork");
      window.location.href = getConsoleForkUrl(botId);
    } catch {
      /* ignore */
    }
  }, [account]);

  return null;
}
