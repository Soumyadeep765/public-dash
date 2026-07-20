"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BrandMark } from "./BrandMark";
import { ThemeToggle } from "./ThemeToggle";
import { HeaderSearch } from "./HeaderSearch";
import { UserNav } from "./UserNav";
import { useSessionAccount } from "./SessionProvider";
import {
  getConsoleDashboardUrl,
  getConsoleSignupUrl,
  getTeledevsLoginPath,
} from "@/lib/session";

export function Header() {
  const account = useSessionAccount();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }
      e.preventDefault();
      window.dispatchEvent(new Event("tbh-open-search"));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-header">
      <div className="shell flex h-14 items-center gap-2 sm:gap-3">
        <BrandMark />

        <nav className="hidden items-center gap-1 text-sm font-medium text-fg md:flex">
          <Link href="/explore" className="rounded-md px-2 py-1 hover:bg-btn-hover">
            Community
          </Link>
          <Link href="/templates" className="rounded-md px-2 py-1 hover:bg-btn-hover">
            Templates
          </Link>
        </nav>

        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-1.5">
          <div className="contents md:mr-auto md:block md:w-full md:max-w-[360px] md:flex-1">
            <HeaderSearch />
          </div>
          <ThemeToggle />
          <UserNav
            account={account}
            loginUrl={getTeledevsLoginPath()}
            signupUrl={getConsoleSignupUrl()}
            consoleUrl={getConsoleDashboardUrl()}
          />
        </div>
      </div>
    </header>
  );
}
