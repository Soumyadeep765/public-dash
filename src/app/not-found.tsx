import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="shell">
      <div className="box mx-auto max-w-lg px-6 py-12 text-center">
        <p className="text-sm font-semibold text-muted">404</p>
        <h1 className="mt-1 text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted">
          That developer or bot isn&apos;t public, or doesn&apos;t exist.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Link href="/" className="btn">
            Home
          </Link>
          <Link href="/explore" className="btn btn-primary">
            Community
          </Link>
        </div>
      </div>
    </div>
  );
}
