"use client";

import { useEffect, useState } from "react";
import {
  avatarFallbackUrl,
  detectUserCountry,
  getCleanBotPhotoUrl,
  isTelegramBannedCountry,
  readCachedCountry,
} from "@/lib/botPhoto";

type BotPhotoProps = {
  photo?: string | null;
  username?: string | null;
  name?: string | null;
  alt?: string;
  className?: string;
  size?: number;
};

export function BotPhoto({
  photo,
  username,
  name,
  alt = "",
  className,
  size = 80,
}: BotPhotoProps) {
  const [banned, setBanned] = useState(() => isTelegramBannedCountry(readCachedCountry()));

  useEffect(() => {
    let cancelled = false;
    const cached = readCachedCountry();
    if (cached) {
      setBanned(isTelegramBannedCountry(cached));
      return;
    }

    detectUserCountry().then((code) => {
      if (cancelled || !code) return;
      setBanned(isTelegramBannedCountry(code));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const src = getCleanBotPhotoUrl(photo, username, name, banned);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(event) => {
        const img = event.currentTarget;
        img.onerror = null;
        img.src = avatarFallbackUrl(name, size);
      }}
      onLoad={(event) => {
        const img = event.currentTarget;
        if (img.naturalWidth === 1 && img.naturalHeight === 1) {
          img.onerror = null;
          img.src = avatarFallbackUrl(name, size);
        }
      }}
    />
  );
}
