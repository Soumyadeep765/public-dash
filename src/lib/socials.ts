import type { SocialAccount, SocialType } from "./types";

const LABELS: Record<SocialType, string> = {
  telegram: "Telegram",
  github: "GitHub",
  twitter: "Twitter",
  x: "X",
  discord: "Discord",
  youtube: "YouTube",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  website: "Website",
  other: "Link",
};

export function socialLabel(type: string): string {
  return LABELS[type as SocialType] || "Link";
}

export function socialDisplayValue(social: SocialAccount): string {
  const value = String(social.value || "").replace(/^@/, "");
  if (!value) {
    try {
      return new URL(social.url).hostname.replace(/^www\./, "");
    } catch {
      return social.url;
    }
  }
  return value;
}
