import { Link } from "wouter";
import type { ReactNode } from "react";

/**
 * Renders the small amount of inline markup the reference content uses:
 * `code`, **bold**, and [label](/path) links.
 */
export function Inline({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const pattern = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const [, code, bold, label, href] = match;

    if (code !== undefined) {
      nodes.push(
        <code className="inline-code" key={key++}>
          {code}
        </code>,
      );
    } else if (bold !== undefined) {
      nodes.push(<strong key={key++}>{bold}</strong>);
    } else if (label !== undefined && href !== undefined) {
      const external = /^https?:/.test(href);
      nodes.push(
        external ? (
          <a key={key++} href={href} target="_blank" rel="noreferrer noopener">
            {label}
          </a>
        ) : (
          <Link key={key++} href={href}>
            {label}
          </Link>
        ),
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

  return <>{nodes}</>;
}
