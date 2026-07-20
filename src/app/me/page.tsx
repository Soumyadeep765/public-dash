"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionAccount, useSessionReady } from "@/components/SessionProvider";
import { getTeledevsLoginPath } from "@/lib/session";

/** Optional shortcut to your public profile when signed in. */
export default function MePage() {
  const router = useRouter();
  const account = useSessionAccount();
  const ready = useSessionReady();

  useEffect(() => {
    if (!ready) return;
    if (account?.username) {
      router.replace(`/${account.username}`);
      return;
    }
    // Signed out is fine — offer optional login, don't force console
    router.replace("/");
  }, [account, ready, router]);

  return (
    <div className="shell py-16 text-center text-sm text-muted">
      <p>Checking optional session…</p>
      <p className="mt-2">
        <a href="/" className="link">
          Home
        </a>
        {" · "}
        <a href={getTeledevsLoginPath("/me")} className="link">
          Sign in
        </a>
      </p>
    </div>
  );
}
