import { notFound, permanentRedirect } from "next/navigation";
import { decodeRepoPath, repoRawUrl, resolveRepoSlug } from "@/lib/repo";

type Params = Promise<{ username: string; bot: string; path?: string[] }>;

export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  const { username, bot: rawBot, path: segments } = await params;
  if (rawBot === "b") notFound();

  const resolved = await resolveRepoSlug(username, rawBot);
  if (resolved.kind === "missing") notFound();

  if (resolved.kind === "ambiguous") {
    permanentRedirect(`/${resolved.owner}/${resolved.botUsername}`);
  }

  const filePath = decodeRepoPath(segments);
  if (!filePath) notFound();

  permanentRedirect(repoRawUrl(resolved.repo.basePath, filePath));
}
