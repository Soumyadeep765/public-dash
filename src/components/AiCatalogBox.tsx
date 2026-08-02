import { Sparkles } from "lucide-react";
import { AiCatalogMeta } from "@/components/AiCatalogMeta";
import { cleanAiTags, formatAiCategory } from "@/lib/botCopy";

export function AiCatalogBox({
  category,
  description,
  tags,
  className = "",
}: {
  category?: string | null;
  description?: string | null;
  tags?: string[] | null;
  className?: string;
}) {
  const aiDesc = String(description || "").trim();
  const cat = formatAiCategory(category);
  const cleanTags = cleanAiTags(tags, 10);
  if (!aiDesc && !cat && !cleanTags.length) return null;

  return (
    <section className={`box overflow-hidden ${className}`.trim()}>
      <div className="border-b border-border bg-canvas-subtle px-3 py-2">
        <h2 className="inline-flex items-center gap-1.5 text-sm font-semibold">
          <Sparkles size={14} className="text-accent" />
          AI catalog
        </h2>
      </div>
      <div className="space-y-3 p-3 text-sm">
        {aiDesc ? (
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
              AI-generated description
            </p>
            <p className="text-muted">{aiDesc}</p>
          </div>
        ) : null}

        {(cat || cleanTags.length) ? (
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Category & tags
            </p>
            <AiCatalogMeta category={category} tags={tags} maxTags={10} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
