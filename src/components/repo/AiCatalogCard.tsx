import { Sparkles } from "lucide-react";
import type { PublishedBotSummary } from "@/lib/types";
import { formatAiCategory, cleanAiTags } from "@/lib/botCopy";

export function AiCatalogCard({ bot }: { bot: PublishedBotSummary }) {
  const category = formatAiCategory(bot.ai_category);
  const tags = cleanAiTags(bot.ai_tags, 12);
  const description = String(bot.ai_description || "").trim();

  if (!category && !tags.length && !description) return null;

  return (
    <section className="box overflow-hidden">
      <div className="border-b border-border bg-canvas-subtle px-3 py-2">
        <h2 className="inline-flex items-center gap-1.5 text-sm font-semibold">
          <Sparkles size={14} className="text-muted" />
          AI catalog
        </h2>
      </div>
      <div className="space-y-3 p-3 text-sm">
        {description ? <p className="text-muted">{description}</p> : null}

        {category ? (
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Category
            </p>
            <span className="label">{category}</span>
          </div>
        ) : null}

        {tags.length ? (
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="label">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
