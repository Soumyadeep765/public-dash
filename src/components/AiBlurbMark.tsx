import { Sparkles } from "lucide-react";

/** Small mark shown when the visible blurb is the AI catalog description. */
export function AiBlurbMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded border border-border bg-canvas-subtle px-1 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted ${className}`}
      title="AI-generated from bot command code"
    >
      <Sparkles size={10} className="shrink-0" aria-hidden />
      AI
    </span>
  );
}
