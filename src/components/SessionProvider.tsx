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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const next = await resolveCurrentAccount();
      if (!cancelled) setAccount(next);
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
    <SessionContext.Provider value={account}>{children}</SessionContext.Provider>
  );
}

export function useSessionAccount(): CurrentAccount | null {
  return useContext(SessionContext);
}
