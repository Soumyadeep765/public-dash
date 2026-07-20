/** Marketing / affiliation helpers for Explore. */

export const MAIN_SITE_URL = "https://telebothost.com";
export const DOCS_API_URL = "https://api.telebothost.com/api/v1/docs";

export function getMainSiteUrl(): string {
  return process.env.NEXT_PUBLIC_MAIN_SITE_URL?.replace(/\/$/, "") || MAIN_SITE_URL;
}
