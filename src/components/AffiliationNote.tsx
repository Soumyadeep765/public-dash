import { getMainSiteUrl } from "@/lib/brand";

export function AffiliationNote({ className = "" }: { className?: string }) {
  const main = getMainSiteUrl();
  return (
    <p className={`text-sm text-muted ${className}`.trim()}>
      Explore on teledevs.me is an official TeleBotHost product. Same accounts, same bots. Built
      with{" "}
      <a href={main} className="link" target="_blank" rel="noreferrer">
        telebothost.com
      </a>
      .
    </p>
  );
}
