import type { ReadwiseDocument } from "@emstack/types";

import { ExternalLink } from "lucide-react";

import { readingTime } from "./-readwiseFormat";
import { RadialProgress } from "../DashboardCard/-cardKit";

function ArticleMeta({
  doc,
}: { doc: ReadwiseDocument }) {
  const parts = [doc.author, doc.siteName, readingTime(doc.wordCount)].filter(
    (part): part is string => Boolean(part),
  );
  if (parts.length === 0) return null;
  return (
    <span className="truncate text-xs text-muted-foreground">
      {parts.join(" · ")}
    </span>
  );
}

export function ReadwiseArticleList({
  docs,
  showProgress,
}: {
  docs: ReadwiseDocument[];
  showProgress: boolean;
}) {
  return (
    <ul className="flex flex-col divide-y">
      {docs.map(doc => (
        <li
          key={doc.id}
          className="flex flex-row items-center gap-2 py-2"
        >
          {showProgress && (
            <RadialProgress
              current={Math.round(doc.readingProgress * 100)}
              total={100}
              size={20}
            />
          )}
          <div className="flex min-w-0 flex-col">
            {doc.url
              ? (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    truncate text-sm font-medium
                    hover:text-blue-600
                  "
                >
                  {doc.title}
                </a>
              )
              : (
                <span className="truncate text-sm font-medium">{doc.title}</span>
              )}
            <ArticleMeta doc={doc} />
          </div>
          {!!doc.url && (
            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              aria-label="Open article"
              className="
                ml-auto text-muted-foreground
                hover:text-foreground
              "
            >
              <ExternalLink className="size-4" />
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
