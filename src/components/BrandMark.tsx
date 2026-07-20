import Link from "next/link";
import { TbhLogo } from "./TbhLogo";

/** Compact product mark used in the header. */
export function BrandMark() {
  return (
    <Link
      href="/"
      className="group flex shrink-0 items-center gap-2 text-fg"
      aria-label="TeleDevs home"
    >
      <TbhLogo className="h-7 w-7 text-fg transition-opacity group-hover:opacity-85" />
      <span className="hidden font-semibold leading-none sm:inline">
        <span className="text-[15px]">TeleDevs</span>
      </span>
    </Link>
  );
}
