/** Canonical TeleDevs origin. Prefer NEXT_PUBLIC_SITE_URL in production (https://teledevs.me). */
const CANONICAL_SITE_URL = "https://teledevs.me";

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  // Preview deployments may use the ephemeral URL; production must stay on the custom domain.
  // Never fall back to VERCEL_URL in production — it is the deployment hash host, not teledevs.me.
  if (process.env.VERCEL_ENV === "preview") {
    const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
    if (vercel) {
      return vercel.startsWith("http") ? vercel : `https://${vercel}`;
    }
  }

  return CANONICAL_SITE_URL;
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
