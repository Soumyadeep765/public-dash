import { notFound } from "next/navigation";
import { decodeRepoPath, getNodeAtPath, loadRepoByIdResult } from "@/lib/repo";

type Params = Promise<{ username: string; botId: string; path?: string[] }>;

export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  const { username, botId, path: segments } = await params;
  if (!/^\d+$/.test(botId)) notFound();

  const result = await loadRepoByIdResult(username, botId);
  if (result.kind === "missing") notFound();

  const filePath = decodeRepoPath(segments);
  if (!filePath) notFound();

  const repo = result.repo;
  const node = getNodeAtPath(repo.tree, filePath);
  if (!node || node.kind === "folder") notFound();

  const content = node.content || "";

  // Content type mapping
  let contentType = "text/plain; charset=utf-8";
  const lowerPath = node.path.toLowerCase();
  if (lowerPath.endsWith(".json")) {
    contentType = "application/json; charset=utf-8";
  } else if (lowerPath.endsWith(".html")) {
    contentType = "text/html; charset=utf-8";
  } else if (lowerPath.endsWith(".css")) {
    contentType = "text/css; charset=utf-8";
  } else if (lowerPath.endsWith(".js") || lowerPath.endsWith(".mjs") || lowerPath.endsWith(".cjs")) {
    contentType = "application/javascript; charset=utf-8";
  } else if (lowerPath.endsWith(".xml")) {
    contentType = "application/xml; charset=utf-8";
  }

  return new Response(content, {
    headers: {
      "Content-Type": contentType,
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
