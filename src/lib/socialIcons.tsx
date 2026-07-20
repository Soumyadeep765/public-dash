import type { ReactNode } from "react";
import {
  AtSign,
  Camera,
  Code2,
  Globe,
  Link2,
  MessageCircle,
  Play,
  Send,
  UserRound,
} from "lucide-react";
import type { SocialType } from "./types";

export function socialIcon(type: string, size = 16): ReactNode {
  const props = { size, className: "shrink-0" as const };
  switch (type as SocialType) {
    case "telegram":
      return <Send {...props} />;
    case "github":
      return <Code2 {...props} />;
    case "twitter":
    case "x":
      return <AtSign {...props} />;
    case "discord":
      return <MessageCircle {...props} />;
    case "youtube":
      return <Play {...props} />;
    case "instagram":
      return <Camera {...props} />;
    case "linkedin":
      return <UserRound {...props} />;
    case "website":
      return <Globe {...props} />;
    default:
      return <Link2 {...props} />;
  }
}
