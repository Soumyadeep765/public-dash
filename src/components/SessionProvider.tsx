"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  resolveSession,
  type CurrentAccount,
  type SessionSnapshot,
} from "@/lib/session";

type SessionContextValue = {
  account: CurrentAccount | null;
  accounts: CurrentAccount[];
  ready: boolean;
};

const SessionContext = createContext<SessionContextValue>({
  account: null,
  accounts: [],
  ready: false,
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<SessionSnapshot>({
    account: null,
    accounts: [],
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const next = await resolveSession();
      if (cancelled) return;
      setSnapshot(next);
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
    <SessionContext.Provider
      value={{ account: snapshot.account, accounts: snapshot.accounts, ready }}
    >
      <div data-session-ready={ready ? "1" : "0"} className="contents">
        {children}
      </div>
    </SessionContext.Provider>
  );
}

export function useSessionAccount(): CurrentAccount | null {
  return useContext(SessionContext).account;
}

export function useSessionAccounts(): CurrentAccount[] {
  return useContext(SessionContext).accounts;
}

export function useSessionReady(): boolean {
  return useContext(SessionContext).ready;
}
