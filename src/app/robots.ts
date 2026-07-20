import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/me", "/login", "/api/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/me", "/login"],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
