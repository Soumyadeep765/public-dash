import { Sparkles } from "lucide-react";
import { resolveBotDescription } from "@/lib/botCopy";

/** Owner description first; AI fallback with a small notice. */
export function BotDescriptionText({
  bot,
  fallback = "",
  className = "text-sm text-muted",
  clampClassName = "",
}: {
  bot: {
    description?: string | null;
    ai_description?: string | null;
    name?: string | null;
  };
  fallback?: string;
  className?: string;
  clampClassName?: string;
}) {
  const { text, isAiGenerated } = resolveBotDescription(bot, fallback);
  if (!text) return null;

  return (
    <div className="min-w-0">
      <p className={`${className} ${clampClassName}`.trim()}>{text}</p>
      {isAiGenerated ? (
        <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted">
          <Sparkles size={11} className="shrink-0" />
          AI-generated description
        </p>
      ) : null}
    </div>
  );
}
