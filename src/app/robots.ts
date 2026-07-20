import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/me", "/api/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/me"],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
