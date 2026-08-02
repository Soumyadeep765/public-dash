import type { Metadata } from "next";
import { absoluteUrl, getSiteUrl } from "./site";

export const SITE_NAME = "TeleDevs";
export const SITE_TAGLINE =
  "Browse public TeleBotHost bots with README docs, command source, and AI catalog summaries.";

export const DEFAULT_DESCRIPTION =
  "TeleDevs is the official public showcase for TeleBotHost. Browse developer profiles, published Telegram bots, README docs, command source, and AI-generated catalog descriptions tagged from real TBL code.";

const DEFAULT_KEYWORDS = [
  "TeleDevs",
  "teledevs.me",
  "TeleBotHost",
  "Telegram bots",
  "bot templates",
  "Telegram bot store",
  "bot hosting",
  "public bot source",
  "Telegram bot developers",
  "AI bot catalog",
  "TBL",
];

export function pageMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  index = true,
  follow = true,
  type = "website",
  images,
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  index?: boolean;
  follow?: boolean;
  type?: "website" | "article" | "profile";
  images?: string[];
}): Metadata {
  const url = absoluteUrl(path);
  const ogImages = (images?.length ? images : [absoluteUrl("/opengraph-image")]).map((src) => ({
    url: src,
    width: 1200,
    height: 630,
    alt: title,
  }));

  return {
    title,
    description,
    keywords: [...DEFAULT_KEYWORDS, ...keywords],
    alternates: { canonical: url },
    robots: {
      index,
      follow,
      googleBot: {
        index,
        follow,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      type,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((img) => (typeof img.url === "string" ? img.url : String(img.url))),
    },
  };
}

export function organizationJsonLd() {
  const site = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TeleBotHost",
    url: "https://telebothost.com",
    logo: absoluteUrl("/tbh.svg"),
    sameAs: [site, "https://telebothost.com", "https://console.telebothost.com"],
  };
}

export function websiteJsonLd() {
  const site = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: site,
    description: DEFAULT_DESCRIPTION,
    publisher: {
      "@type": "Organization",
      name: "TeleBotHost",
      url: "https://telebothost.com",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${site}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
