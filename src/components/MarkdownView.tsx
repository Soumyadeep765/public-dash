import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { highlightCode } from "@/lib/highlight";
import { isBadgeImage, markdownSanitizeSchema, rehypeBadgeRows } from "@/lib/markdown";

const components: Components = {
  a({ href, children, ...props }) {
    const external = Boolean(href && /^https?:\/\//i.test(href));
    return (
      <a
        href={href}
        {...props}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  },
  img({ src, alt, ...props }) {
    const url = typeof src === "string" ? src : "";
    const label = typeof alt === "string" ? alt : "";
    const badge = isBadgeImage(url, label);
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={label}
        loading="lazy"
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
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          rehypeBadgeRows,
          [rehypeSanitize, markdownSanitizeSchema],
        ]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
