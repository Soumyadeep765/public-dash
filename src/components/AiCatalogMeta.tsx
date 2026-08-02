import { formatAiCategory, cleanAiTags } from "@/lib/botCopy";

export function AiCatalogMeta({
  category,
  tags,
  className = "",
  maxTags = 6,
}: {
  category?: string | null;
  tags?: string[] | null;
  className?: string;
  maxTags?: number;
}) {
  const cat = formatAiCategory(category);
  const cleanTags = cleanAiTags(tags, maxTags);
  if (!cat && !cleanTags.length) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`.trim()}>
      {cat ? (
        <span className="label" title="AI category">
          {cat}
        </span>
      ) : null}
      {cleanTags.map((tag) => (
        <span key={tag} className="label" title="AI tag">
          {tag}
        </span>
      ))}
    </div>
  );
}
