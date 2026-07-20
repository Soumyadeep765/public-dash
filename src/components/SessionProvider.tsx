"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  resolveCurrentAccount,
  type CurrentAccount,
} from "@/lib/session";

const SessionContext = createContext<CurrentAccount | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<CurrentAccount | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const next = await resolveCurrentAccount();
      if (cancelled) return;
      // If handoff redirect started, this page is unloading — keep unsigned UI
      // until we return with #tbh-account=...
      setAccount(next);
      setReady(true);
    }

    load();

    function onFocus() {
      load();
    }

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") load();
    });

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return (
    <SessionContext.Provider value={account}>
      <div data-session-ready={ready ? "1" : "0"} className="contents">
        {children}
      </div>
    </SessionContext.Provider>
  );
}

export function useSessionAccount(): CurrentAccount | null {
  return useContext(SessionContext);
}
