import Link from "next/link";
import { TbhLogo } from "@/components/TbhLogo";
import { AffiliationNote } from "@/components/AffiliationNote";
import { DOCS_API_URL, getMainSiteUrl } from "@/lib/brand";
import { getConsoleSignupUrl, getTeledevsLoginPath } from "@/lib/session";

export function Footer() {
  const main = getMainSiteUrl();

  return (
    <footer className="mt-auto border-t border-border bg-canvas-subtle/40 py-8 text-sm text-muted">
      <div className="shell grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 font-semibold text-fg">
            <TbhLogo className="h-5 w-5" />
            TeleDevs
          </div>
          <AffiliationNote />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fg">Product</p>
          <ul className="space-y-1.5">
            <li>
              <Link href="/explore" className="hover:text-fg hover:underline">
                Community bots
              </Link>
            </li>
            <li>
              <Link href="/templates" className="hover:text-fg hover:underline">
                Templates
              </Link>
            </li>
            <li>
              <Link href="/upgrade" className="hover:text-fg hover:underline">
                Plans & upgrades
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fg">Learn</p>
          <ul className="space-y-1.5">
            <li>
              <Link href="/about" className="hover:text-fg hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-fg hover:underline">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-fg hover:underline">
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fg">TeleBotHost</p>
          <ul className="space-y-1.5">
            <li>
              <a href={main} className="hover:text-fg hover:underline" target="_blank" rel="noreferrer">
                Main site
              </a>
            </li>
            <li>
              <a href={getConsoleSignupUrl()} className="hover:text-fg hover:underline">
                Sign up
              </a>
            </li>
            <li>
              <a href={getTeledevsLoginPath()} className="hover:text-fg hover:underline">
                Sign in
              </a>
            </li>
            <li>
              <a
                href={DOCS_API_URL}
                className="hover:text-fg hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Public API
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="shell mt-8 border-t border-border pt-4 text-xs">
        <p>© {new Date().getFullYear()} TeleBotHost. TeleDevs is an official product.</p>
      </div>
    </footer>
  );
}
