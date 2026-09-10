"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, X } from "lucide-react";

interface Ad {
  id: number;
  title: string;
  text: string;
  button?: string;
  url: string;
}

interface AdBannerProps {
  position?: "banner" | "inline";
}

export function AdBanner({ position = "banner" }: AdBannerProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetch("/ads.json", { cache: "no-store" })
      .then((res) => res.json())
      .then((ads: Ad[]) => {
        if (ads && ads.length > 0) {
          const randomAd = ads[Math.floor(Math.random() * ads.length)];
          setAd(randomAd);
          setIsVisible(true);
        }
      })
      .catch((err) => {
        console.error("Failed to load ads:", err);
      });
  }, []);

  if (!isVisible || !ad) return null;

  if (position === "inline") {
    return (
      <div className="box relative flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between overflow-hidden">
        <div className="pr-6">
          <h3 className="font-semibold flex items-center gap-1.5">
            <Sparkles size={16} className="text-accent" />
            {ad.title || "Sponsored"}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {ad.text}
          </p>
        </div>
        <div className="flex shrink-0">
          <a
            href={ad.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary group flex items-center gap-1.5"
          >
            {ad.button || "Learn more"} 
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border bg-canvas-subtle">
      <div className="shell flex items-center justify-between py-2.5 gap-x-6">
        <div className="flex flex-wrap flex-1 items-center justify-start gap-x-3 gap-y-1 text-left pr-8 sm:pr-0">
          <p className="text-sm text-fg flex flex-wrap items-center justify-start gap-x-2">
            <strong className="font-semibold flex items-center gap-1.5">
              <Sparkles size={14} className="text-accent" />
              {ad.title || "Sponsored"}
            </strong>
            <span className="hidden sm:inline text-muted/40">-</span>
            <span className="inline sm:hidden w-full block"></span>
            <span className="text-muted">{ad.text}</span>
          </p>
          <a
            href={ad.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn py-1 px-3 text-xs sm:text-sm group flex items-center gap-1 shrink-0"
          >
            {ad.button || "Learn more"} 
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
        <div className="absolute right-3 sm:relative sm:right-0 flex shrink-0">
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="text-muted hover:text-fg transition-colors p-1"
          >
            <span className="sr-only">Dismiss</span>
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
