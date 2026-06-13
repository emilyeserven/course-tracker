// Pure parser for the repo CHANGELOG.md (the Keep a Changelog / release-please
// shape: `## [version] - date` releases, `### Section` groups, `-` list items).
// No component imports, so it stays unit-testable like -dashboardTileMeta.ts;
// the raw markdown import and inline rendering live in -DashboardChangelog.tsx.

export interface ChangelogSection {
  /** Section heading, e.g. "Bug Fixes" — "" for items with no `###` heading. */
  heading: string;
  /** Raw list-item text with inline markdown intact (e.g. "Fix … (#266)"). */
  items: string[];
}

export interface ChangelogRelease {
  /** Version label, e.g. "1.0.0" (brackets stripped) or the raw heading text. */
  version: string;
  /** Release date as written, e.g. "2026-06-13", or null when absent. */
  date: string | null;
  sections: ChangelogSection[];
}

const RELEASE_HEADING = /^##\s+(.+?)\s*$/;
const SECTION_HEADING = /^###\s+(.+?)\s*$/;
const LIST_ITEM = /^[-*]\s+(.+?)\s*$/;
// "[1.0.0] - 2026-06-13" / "1.0.0 - 2026-06-13" → version (brackets optional)
// plus an optional trailing date after an en- or hyphen dash.
const VERSION_DATE = /^\[?(.+?)\]?(?:\s*[-–]\s*(.+))?$/;

/**
 * Parses CHANGELOG.md into releases, each grouped into titled sections. Lenient
 * about formatting: anything before the first `##` release heading (the doc
 * title and intro) is ignored, and non-list, non-heading lines inside a release
 * are skipped.
 */
export function parseChangelog(markdown: string): ChangelogRelease[] {
  const releases: ChangelogRelease[] = [];
  let release: ChangelogRelease | null = null;
  let section: ChangelogSection | null = null;

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.replace(/\r$/, "").trimEnd();

    const releaseMatch = RELEASE_HEADING.exec(line);
    if (releaseMatch) {
      const versionDate = VERSION_DATE.exec(releaseMatch[1]);
      release = {
        version: versionDate ? versionDate[1].trim() : releaseMatch[1],
        date: versionDate?.[2]?.trim() ?? null,
        sections: [],
      };
      section = null;
      releases.push(release);
      continue;
    }

    // Drop the `# Changelog` title and intro paragraph above the first release.
    if (!release) continue;

    const sectionMatch = SECTION_HEADING.exec(line);
    if (sectionMatch) {
      section = {
        heading: sectionMatch[1],
        items: [],
      };
      release.sections.push(section);
      continue;
    }

    const itemMatch = LIST_ITEM.exec(line);
    if (itemMatch) {
      if (!section) {
        section = {
          heading: "",
          items: [],
        };
        release.sections.push(section);
      }
      section.items.push(itemMatch[1]);
    }
  }

  return releases;
}
