import type { Metadata } from "next";
import { LoginClient } from "@/components/LoginClient";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sign in",
  description: "Continue with your TeleBotHost account to use TeleDevs signed-in features.",
  path: "/login",
  index: false,
});

type SearchParams = Promise<{
  next?: string | string[];
  switch?: string | string[];
}>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function safeNextPath(raw: string | undefined): string {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) return "/";
  return raw;
}

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const next = safeNextPath(first(sp.next));
  const isSwitch = first(sp.switch) === "1";

  return <LoginClient nextPath={next} isSwitch={isSwitch} />;
}
