import type { ReactNode } from "react";

export const REPO_URL = "https://github.com/emilyeserven/course-tracker";

// Inline markdown inside list items: `code`, [text](url) links, and (#123) PR
// references which we linkify to the matching GitHub pull request.
const INLINE_TOKEN = /(`[^`]+`)|(\[[^\]]+\]\([^)]+\))|#(\d+)/g;
const LINK = /^\[([^\]]+)\]\(([^)]+)\)$/;

const linkClass = `
  text-primary underline-offset-2
  hover:underline
`;

export function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(INLINE_TOKEN)) {
    const index = match.index;
    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index));
    }

    const [token, code, link, prNumber] = match;
    if (code != null) {
      nodes.push(
        <code
          key={key++}
          className="rounded-sm bg-muted px-1 py-0.5 text-xs"
        >
          {code.slice(1, -1)}
        </code>,
      );
    }
    else if (link != null) {
      const parts = LINK.exec(link);
      nodes.push(
        <a
          key={key++}
          href={parts?.[2] ?? "#"}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          {parts?.[1] ?? link}
        </a>,
      );
    }
    else {
      nodes.push(
        <a
          key={key++}
          href={`${REPO_URL}/pull/${prNumber}`}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          {`#${prNumber}`}
        </a>,
      );
    }

    lastIndex = index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
