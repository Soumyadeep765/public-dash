import { Sparkles, Star } from "lucide-react";
import type { PublishedBotSummary } from "@/lib/types";
import { formatAiCategory, cleanAiTags } from "@/lib/botCopy";

export function AiCatalogCard({ bot }: { bot: PublishedBotSummary }) {
  const category = formatAiCategory(bot.ai_category);
  const tags = cleanAiTags(bot.ai_tags, 12);
  const description = String(bot.ai_description || "").trim();
  const score =
    typeof bot.ai_score === "number" && Number.isFinite(bot.ai_score)
      ? Math.max(0, Math.min(100, Math.round(bot.ai_score)))
      : null;
  const rating =
    typeof bot.ai_rating === "number" && Number.isFinite(bot.ai_rating)
      ? bot.ai_rating
      : null;

  if (!category && !tags.length && !description && score == null) return null;

  return (
    <section className="box overflow-hidden">
      <div className="border-b border-border bg-canvas-subtle px-3 py-2">
        <h2 className="inline-flex items-center gap-1.5 text-sm font-semibold">
          <Sparkles size={14} className="text-muted" />
          AI catalog
        </h2>
      </div>
      <div className="space-y-3 p-3 text-sm">
        {score != null ? (
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
              AI score
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold tabular-nums">{score}/100</span>
              {rating != null ? (
                <span className="inline-flex items-center gap-1 text-xs text-muted" title="AI star rating">
                  <Star size={12} />
                  {rating.toFixed(1)}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

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
