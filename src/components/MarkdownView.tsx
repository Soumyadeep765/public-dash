import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import { highlightCode } from "@/lib/highlight";
import {
  isBadgeImage,
  isSafeUserContentUrl,
  markdownSanitizeSchema,
  rehypeBadgeRows,
  rehypeStripHeadingRules,
} from "@/lib/markdown";

const components: Components = {
  a({ href, children, ...props }) {
    const safe = isSafeUserContentUrl(href);
    if (!safe) {
      return <span {...props}>{children}</span>;
    }
    const external = Boolean(href && /^(https?:|mailto:|tg:)/i.test(href));
    return (
      <a
        href={href}
        {...props}
        {...(external
          ? { target: "_blank", rel: "nofollow ugc noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  },
  img({ src, alt, ...props }) {
    const url = typeof src === "string" ? src : "";
    const label = typeof alt === "string" ? alt : "";
    if (!isSafeUserContentUrl(url)) {
      return label ? <span className="text-muted">{label}</span> : null;
    }
    const badge = isBadgeImage(url, label);
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={label}
        loading="lazy"
        referrerPolicy="no-referrer"
        className={badge ? "md-badge" : "md-image"}
        {...props}
      />
    );
  },
  code({ className, children, ...props }) {
    const text = String(children).replace(/\n$/, "");
    const lang = /language-([\w+-]+)/.exec(className || "")?.[1];
    if (lang) {
      return (
        <code
          className={`${className || ""} hljs-code`.trim()}
          dangerouslySetInnerHTML={{ __html: highlightCode(text, lang) }}
          {...props}
        />
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  input({ type, checked, ...props }) {
    if (type === "checkbox") {
      return <input type="checkbox" checked={Boolean(checked)} disabled readOnly {...props} />;
    }
    return <input type={type} {...props} />;
  },
};

/** Normalize common README quirks before parse. */
function preprocessMarkdown(source: string): string {
  let text = String(source || "").replace(/\r\n/g, "\n");

  // `# Heading\n---` / `## Heading\n***` → heading only (no extra rule line)
  text = text.replace(
    /^(#{1,6}[^\n]*?)\n[ \t]*\n?(?:-{3,}|\*{3,}|_{3,})[ \t]*(?:\n|$)/gm,
    "$1\n\n",
  );

  // `---\n\n## Heading` → just the heading (section rule before heading)
  text = text.replace(
    /(?:^|\n)[ \t]*(?:-{3,}|\*{3,}|_{3,})[ \t]*\n{1,2}(#{1,6}[^\n]*)/g,
    "\n\n$1",
  );

  // Collapse 3+ blank lines so parsers don't leave empty gap blocks
  text = text.replace(/\n{3,}/g, "\n\n");

  return text;
}

export function MarkdownView({
  content,
  className = "px-4 py-5 sm:px-6",
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={`markdown-body ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeRaw,
          rehypeStripHeadingRules,
          rehypeBadgeRows,
          [rehypeSanitize, markdownSanitizeSchema],
          rehypeKatex,
        ]}
        components={components}
      >
        {preprocessMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}
