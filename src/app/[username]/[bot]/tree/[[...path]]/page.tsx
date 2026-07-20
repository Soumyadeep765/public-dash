import { permanentRedirect, notFound } from "next/navigation";
import { decodeRepoPath, repoTreeUrl, resolveRepoSlug } from "@/lib/repo";

type Params = Promise<{ username: string; bot: string; path?: string[] }>;

export default async function TreeSlugRedirectPage({ params }: { params: Params }) {
  const { username, bot: rawBot, path: segments } = await params;
  if (rawBot === "b") notFound();

  const resolved = await resolveRepoSlug(username, rawBot);
  if (resolved.kind === "missing") notFound();

  if (resolved.kind === "ambiguous") {
    permanentRedirect(`/${resolved.owner}/${resolved.botUsername}`);
  }

  const dirPath = decodeRepoPath(segments);
  permanentRedirect(repoTreeUrl(resolved.repo.basePath, dirPath));
}
