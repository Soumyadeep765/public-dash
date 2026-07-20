import { redirect, notFound } from "next/navigation";
import { ApiError, getStoreBot } from "@/lib/api";
import { botExplorePath } from "@/lib/repo";

type Params = Promise<{ id: string }>;

export default async function StoreRedirectPage({ params }: { params: Params }) {
  const { id } = await params;

  let bot;
  try {
    bot = await getStoreBot(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  if (bot.owner_username && bot.bot_id) {
    redirect(botExplorePath(bot.owner_username, bot.bot_id));
  }

  notFound();
}
