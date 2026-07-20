"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionAccount } from "@/components/SessionProvider";
import { getConsoleLoginUrl } from "@/lib/session";

/** Optional shortcut to your public profile when signed in. */
export default function MePage() {
  const router = useRouter();
  const account = useSessionAccount();
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setWaited(true), 2500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (account?.username) {
      router.replace(`/${account.username}`);
      return;
    }
    if (waited) router.replace("/");
  }, [account, waited, router]);

  return (
    <div className="shell py-16 text-center text-sm text-muted">
      <p>Checking optional session…</p>
      <p className="mt-2">
        <a href="/" className="link">
          Home
        </a>
        {" · "}
        <a href={getConsoleLoginUrl("/")} className="link">
          Sign in
        </a>
      </p>
    </div>
  );
}
