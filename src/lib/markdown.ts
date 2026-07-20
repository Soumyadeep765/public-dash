import type { Root, Element, ElementContent } from "hast";
import { defaultSchema } from "rehype-sanitize";

const BADGE_HOST_RE =
  /(?:^|\.)(?:shields\.io|img\.shields\.io|badge\.fury\.io|badgen\.net|flat\.badgen\.net|progressed\.io|codecov\.io|coveralls\.io|snyk\.io|vercel\.app|gitpod\.io|codesandbox\.io|app\.fossa\.io|api\.netlify\.com|ci\.appveyor\.com|circleci\.com|travis-ci\.(?:com|org)|dev\.azure\.com)/i;

const BADGE_PATH_RE =
  /\/(?:badge|badges|shields?|matrix|workflow\/status|actions\/workflows)(?:\/|$|\.)/i;

export function isBadgeImage(src?: string | null, alt?: string | null): boolean {
  const url = String(src || "").trim();
  const label = String(alt || "").trim();
  if (!url) return false;
  if (/badge/i.test(label)) return true;
  try {
    const parsed = new URL(url, "https://teledevs.me");
    if (BADGE_HOST_RE.test(parsed.hostname)) return true;
    if (BADGE_PATH_RE.test(parsed.pathname)) return true;
    if (/[?&]style=(?:flat|flat-square|plastic|for-the-badge|social)\b/i.test(parsed.search)) {
      return true;
    }
  } catch {
    if (/shields\.io|badge\.|\/badge\//i.test(url)) return true;
  }
  return false;
}

function isElement(node: unknown): node is Element {
  return Boolean(node && typeof node === "object" && (node as Element).type === "element");
}

function isWhitespaceText(node: ElementContent): boolean {
  return node.type === "text" && !node.value.trim();
}

function isBadgeNode(node: ElementContent): boolean {
  if (!isElement(node)) return false;
  if (node.tagName === "img") {
    return isBadgeImage(
      String(node.properties?.src || ""),
      String(node.properties?.alt || ""),
    );
  }
  if (node.tagName === "a") {
    const meaningful = node.children.filter((child) => !isWhitespaceText(child));
    return meaningful.length === 1 && isBadgeNode(meaningful[0]);
  }
  return false;
}

function isBadgeOnlyParagraph(node: ElementContent): boolean {
  if (!isElement(node) || node.tagName !== "p") return false;
  const meaningful = node.children.filter((child) => !isWhitespaceText(child));
  return meaningful.length > 0 && meaningful.every(isBadgeNode);
}

function collectBadgeNodes(paragraphs: Element[]): ElementContent[] {
  const out: ElementContent[] = [];
  paragraphs.forEach((p, index) => {
    p.children.forEach((child) => {
      if (isWhitespaceText(child)) return;
      out.push(child);
    });
    if (index < paragraphs.length - 1) {
      out.push({ type: "text", value: " " });
    }
  });
  return out;
}

/** Merge consecutive badge-only paragraphs into one wrapping flex row. */
export function rehypeBadgeRows() {
  return (tree: Root) => {
    const next: ElementContent[] = [];
    const children = tree.children as ElementContent[];
    let i = 0;

    while (i < children.length) {
      const node = children[i];
      if (isBadgeOnlyParagraph(node)) {
        const group: Element[] = [];
        while (i < children.length && isBadgeOnlyParagraph(children[i])) {
          group.push(children[i] as Element);
          i += 1;
        }
        next.push({
          type: "element",
          tagName: "div",
          properties: { className: ["md-badge-row"] },
          children: collectBadgeNodes(group),
        });
        continue;
      }

      if (isElement(node) && node.tagName === "p") {
        const meaningful = node.children.filter((child) => !isWhitespaceText(child));
        if (meaningful.length > 1 && meaningful.every(isBadgeNode)) {
          next.push({
            type: "element",
            tagName: "div",
            properties: { className: ["md-badge-row"] },
            children: node.children,
          });
          i += 1;
          continue;
        }
      }

      next.push(node);
      i += 1;
    }

    tree.children = next as Root["children"];
  };
}

export const markdownSanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    "div",
    "span",
    "picture",
    "source",
    "figure",
    "figcaption",
    "details",
    "summary",
    "kbd",
    "mark",
    "u",
    "sub",
    "sup",
    "section",
  ],
  attributes: {
    ...defaultSchema.attributes,
    div: [...(defaultSchema.attributes?.div || []), "className", "align"],
    span: [...(defaultSchema.attributes?.span || []), "className"],
    p: [...(defaultSchema.attributes?.p || []), "align", "className"],
    img: [
      ...(defaultSchema.attributes?.img || []),
      "className",
      "loading",
      "width",
      "height",
      "align",
    ],
    a: [...(defaultSchema.attributes?.a || []), "className", "target", "rel"],
    code: [...(defaultSchema.attributes?.code || []), "className"],
    pre: [...(defaultSchema.attributes?.pre || []), "className"],
    h1: [...(defaultSchema.attributes?.h1 || []), "id"],
    h2: [...(defaultSchema.attributes?.h2 || []), "id"],
    h3: [...(defaultSchema.attributes?.h3 || []), "id"],
    h4: [...(defaultSchema.attributes?.h4 || []), "id"],
    h5: [...(defaultSchema.attributes?.h5 || []), "id"],
    h6: [...(defaultSchema.attributes?.h6 || []), "id"],
    details: ["open", "className"],
    summary: ["className"],
    section: ["className"],
  },
  protocols: {
    ...defaultSchema.protocols,
    // No data: URIs — can embed deceptive phishing-like images/UI in user READMEs
    src: ["https", "http"],
    href: ["https", "http", "mailto", "tg"],
  },
};

/** Block schemes Safe Browsing often associates with deceptive / phishing pages. */
export function isSafeUserContentUrl(href?: string | null): boolean {
  const raw = String(href || "").trim();
  if (!raw) return false;
  if (raw.startsWith("/") && !raw.startsWith("//")) return true;
  if (raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tg:")) return true;
  try {
    const parsed = new URL(raw, "https://teledevs.me");
    const protocol = parsed.protocol.toLowerCase();
    if (protocol === "https:" || protocol === "http:") return true;
    if (protocol === "mailto:" || protocol === "tg:") return true;
    return false;
  } catch {
    return false;
  }
}
