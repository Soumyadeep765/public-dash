import type { MetadataRoute } from "next";
import { getStoreBot, listStoreBots, listTemplates } from "@/lib/api";
import { botExplorePath } from "@/lib/repo";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${site}/explore`, lastModified: now, changeFrequency: "hourly", priority: 0.95 },
    { url: `${site}/templates`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${site}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${site}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: `${site}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site}/upgrade`, lastModified: now, changeFrequency: "monthly", priority: 0.55 },
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = [];
  const profileSet = new Set<string>();

  try {
    const pages = await Promise.all([
      listStoreBots({ page: 1, limit: 50 }),
      listStoreBots({ page: 2, limit: 50 }).catch(() => null),
    ]);

    const storeBots = pages.flatMap((page) => page?.bots || []);
    const details = await Promise.all(
      storeBots.map(async (bot) => {
        try {
          return await getStoreBot(bot._id);
        } catch {
          return bot;
        }
      })
    );

    for (const bot of details) {
      const owner = bot.owner_username;
      if (!owner || !bot.bot_id) continue;

      const ownerKey = owner.toLowerCase();
      if (!profileSet.has(ownerKey)) {
        profileSet.add(ownerKey);
        dynamicRoutes.push({
          url: `${site}/${owner}`,
          lastModified: bot.updated_at ? new Date(bot.updated_at) : now,
          changeFrequency: "weekly",
          priority: 0.75,
        });
      }

      const base = `${site}${botExplorePath(owner, bot.bot_id)}`;
      const lastMod = bot.updated_at ? new Date(bot.updated_at) : now;
      dynamicRoutes.push(
        {
          url: base,
          lastModified: lastMod,
          changeFrequency: "daily",
          priority: 0.85,
        },
        {
          url: `${base}/blob/README.md`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.55,
        },
        {
          url: `${base}/tree/commands`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.55,
        }
      );
    }
  } catch {
    /* keep static routes */
  }

  try {
    const templates = await listTemplates({ limit: 50 });
    for (const bot of templates.templates) {
      const owner = bot.owner_username;
      if (!owner || !bot.bot_id) continue;

      const ownerKey = owner.toLowerCase();
      if (!profileSet.has(ownerKey)) {
        profileSet.add(ownerKey);
        dynamicRoutes.push({
          url: `${site}/${owner}`,
          lastModified: bot.updated_at ? new Date(bot.updated_at) : now,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }

      dynamicRoutes.push({
        url: `${site}${botExplorePath(owner, bot.bot_id)}`,
        lastModified: bot.updated_at ? new Date(bot.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    /* optional */
  }

  return [...staticRoutes, ...dynamicRoutes];
}
