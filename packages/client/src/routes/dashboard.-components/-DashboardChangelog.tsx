import type { DashboardTileProps } from "./-dashboardTileMeta";
import type { ReactNode } from "react";

// Bundled at build time from the repo-root CHANGELOG.md (the `@root` Vite
// alias), so the card needs no API round-trip and the file stays the single
// source of truth — Vite inlines `?raw` imports into the bundle. fallow's
// static resolver only reads tsconfig paths, so the Vite-only alias reads as
// unresolved; the import is real, hence the suppression.
// fallow-ignore-next-line unresolved-import
import changelogMarkdown from "@root/CHANGELOG.md?raw";

import { parseChangelog } from "./-changelog";
import { CardSettingsFlyout } from "./-DashboardCardSettings";
import { isAutoHeight } from "./-dashboardTileMeta";

import { DashboardCard } from "@/components/boxes/DashboardCard";

const REPO_URL = "https://github.com/emilyeserven/course-tracker";

const releases = parseChangelog(changelogMarkdown);

// Inline markdown inside list items: `code`, [text](url) links, and (#123) PR
// references which we linkify to the matching GitHub pull request.
const INLINE_TOKEN = /(`[^`]+`)|(\[[^\]]+\]\([^)]+\))|#(\d+)/g;
const LINK = /^\[([^\]]+)\]\(([^)]+)\)$/;

const linkClass = `
  text-primary underline-offset-2
  hover:underline
`;

function renderInline(text: string): ReactNode[] {
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

export function DashboardChangelog({
  tile,
  onUpdateTile,
}: DashboardTileProps) {
  return (
    <DashboardCard
      autoHeight={isAutoHeight(tile)}
      title="Changelog"
      action={(
        <a
          href={`${REPO_URL}/blob/HEAD/CHANGELOG.md`}
          target="_blank"
          rel="noreferrer"
          className="
            text-sm text-primary underline-offset-2
            hover:underline
          "
        >
          View on GitHub
        </a>
      )}
      settings={(
        <CardSettingsFlyout
          tile={tile}
          onUpdateTile={onUpdateTile}
        />
      )}
    >
      {releases.length === 0
        ? (
          <p className="text-sm text-muted-foreground">
            <i>No changelog entries.</i>
          </p>
        )
        : (
          <div className="flex flex-col gap-2">
            {releases.map((release, releaseIndex) => (
              <details
                key={release.version}
                open={releaseIndex === 0}
                className="rounded-md border bg-background/40"
              >
                <summary
                  className="
                    flex cursor-pointer items-center justify-between gap-2 px-3
                    py-2 text-sm font-semibold
                  "
                >
                  <span>{release.version}</span>
                  {release.date != null && (
                    <span className="text-xs font-normal text-muted-foreground">
                      {release.date}
                    </span>
                  )}
                </summary>
                <div className="flex flex-col gap-3 px-3 pb-3">
                  {release.sections.map(section => (
                    <div
                      key={section.heading || "general"}
                      className="flex flex-col gap-1"
                    >
                      {section.heading !== "" && (
                        <h3
                          className="
                            text-xs font-semibold tracking-wide
                            text-muted-foreground uppercase
                          "
                        >
                          {section.heading}
                        </h3>
                      )}
                      <ul className="flex list-disc flex-col gap-1 pl-4">
                        {section.items.map(item => (
                          <li
                            key={item}
                            className="text-sm/snug"
                          >
                            {renderInline(item)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}
    </DashboardCard>
  );
}
