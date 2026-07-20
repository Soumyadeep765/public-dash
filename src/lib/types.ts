export type ListingType = "bot_template" | "community_store";

export type SocialType =
  | "telegram"
  | "github"
  | "twitter"
  | "x"
  | "discord"
  | "youtube"
  | "instagram"
  | "linkedin"
  | "website"
  | "other";

export interface SocialAccount {
  type: SocialType | string;
  value: string;
  url: string;
}

export interface PublicProfile {
  id: string;
  profile: {
    name: string;
    username: string;
    bio: string | null;
    avatar: string | null;
    is_verified: boolean;
    socials?: SocialAccount[];
  };
  stats: {
    published_bots: number;
    bot_templates: number;
    community_store_listings: number;
  };
  published_bots_path: string;
  created_at: string;
}

export interface PublishedBotSummary {
  bot_id: number;
  name: string;
  photo: string;
  bot_username: string;
  owner_username: string | null;
  owner_avatar?: string | null;
  listing_type: ListingType | null;
  listing_type_label: string | null;
  description: string;
  commands_count: number;
  profile_path?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BotCommand {
  name: string;
  code: string;
  answer: string;
  keyboard: string;
  parse_mode: string;
  aliases: string[];
  allow_only_group: boolean;
  need_reply: boolean;
  is_web: number;
  folder?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BotEnv {
  name: string;
  placeholder: string;
  value: string | null;
}

export interface PublishedBotDetail extends PublishedBotSummary {
  readme: string;
  envs: BotEnv[];
  commands: BotCommand[];
  profile_path?: string | null;
  readme_path?: string | null;
}

export interface StoreBot {
  _id: string;
  bot_id: number;
  name: string;
  username: string;
  description: string;
  category: string;
  tags: string[];
  image: string;
  developer: string;
  rating: number;
  bot_url: string;
  install_count: number;
  last_installed_at?: string;
  created_at: string;
  updated_at: string;
  owner_username?: string | null;
  profile_path?: string | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages?: number;
}

export interface SearchUserHit {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  avatar: string | null;
  is_verified: boolean;
  stats: {
    published_bots: number;
    bot_templates: number;
    community_store_listings: number;
  };
  profile_path: string;
  created_at?: string;
}

export interface SearchBotHit extends PublishedBotSummary {
  profile_path?: string | null;
}

export interface PublicSearchResult {
  q: string;
  type: "all" | "users" | "bots";
  users: SearchUserHit[];
  bots: SearchBotHit[];
  counts: { users: number; bots: number };
}

export type RepoFileKind = "readme" | "env" | "yaml" | "command" | "folder";

export interface RepoFileNode {
  id: string;
  name: string;
  path: string;
  kind: RepoFileKind;
  language?: string;
  content?: string;
  children?: RepoFileNode[];
  /** ISO timestamp — per-command for files; newest child for folders */
  updatedAt?: string | null;
}
