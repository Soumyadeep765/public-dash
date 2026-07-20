import Link from "next/link";
import { breadcrumbParts, repoBlobUrl, repoTreeUrl } from "@/lib/repo";

export function PathBreadcrumbs({
  basePath,
  owner,
  handle,
  path,
  mode,
}: {
  basePath: string;
  owner: string;
  handle: string;
  path: string;
  mode: "tree" | "blob";
}) {
  const crumbs = breadcrumbParts(path);

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm">
      <Link href={basePath} className="font-semibold text-accent hover:underline">
        {handle}
      </Link>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        const href =
          isLast && mode === "blob"
            ? repoBlobUrl(basePath, crumb.path)
            : repoTreeUrl(basePath, crumb.path);

        return (
          <span key={crumb.path} className="inline-flex items-center gap-1">
            <span className="text-muted">/</span>
            {isLast ? (
              <span className="font-semibold text-fg">{crumb.name}</span>
            ) : (
              <Link href={href} className="text-accent hover:underline">
                {crumb.name}
              </Link>
            )}
          </span>
        );
      })}
      <span className="sr-only">
        {owner}/{handle}
        {path ? `/${path}` : ""}
      </span>
    </nav>
  );
}
