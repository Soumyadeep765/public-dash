import type { ReactNode } from "react";
import {
  Github,
  Globe,
  Instagram,
  Linkedin,
  Link2,
  MessageCircle,
  Send,
  Twitter,
  Youtube,
} from "lucide-react";
import type { SocialType } from "./types";

export function socialIcon(type: string, size = 16): ReactNode {
  const props = { size, className: "shrink-0" as const };
  switch (type as SocialType) {
    case "telegram":
      return <Send {...props} />;
    case "github":
      return <Github {...props} />;
    case "twitter":
    case "x":
      return <Twitter {...props} />;
    case "discord":
      return <MessageCircle {...props} />;
    case "youtube":
      return <Youtube {...props} />;
    case "instagram":
      return <Instagram {...props} />;
    case "linkedin":
      return <Linkedin {...props} />;
    case "website":
      return <Globe {...props} />;
    default:
      return <Link2 {...props} />;
  }
}
