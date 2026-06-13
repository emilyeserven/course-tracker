import { describe, expect, test } from "vitest";

import { parseChangelog } from "./-changelog";

const SAMPLE = `# Changelog

All notable changes to this project are documented here.

## [1.2.0] - 2026-06-13

### Bug Fixes

- Fix radar slice labels getting clipped (#266)
- Refactor combobox grouping to use explicit \`group\` field (#230)

### Features

- Add daily streak badge (#101)

## [1.1.0]

### Changed

- Speed up Docker builds (#241)
`;

describe("parseChangelog", () => {
  test("splits the document into one release per `##` heading", () => {
    const releases = parseChangelog(SAMPLE);
    expect(releases.map(r => r.version)).toEqual(["1.2.0", "1.1.0"]);
  });

  test("strips brackets from the version and pulls out the date", () => {
    const [first] = parseChangelog(SAMPLE);
    expect(first.version).toBe("1.2.0");
    expect(first.date).toBe("2026-06-13");
  });

  test("leaves date null when the heading omits it", () => {
    const second = parseChangelog(SAMPLE)[1];
    expect(second.version).toBe("1.1.0");
    expect(second.date).toBeNull();
  });

  test("groups list items under their `###` section heading", () => {
    const [first] = parseChangelog(SAMPLE);
    expect(first.sections.map(s => s.heading)).toEqual([
      "Bug Fixes",
      "Features",
    ]);
    expect(first.sections[0].items).toEqual([
      "Fix radar slice labels getting clipped (#266)",
      "Refactor combobox grouping to use explicit `group` field (#230)",
    ]);
    expect(first.sections[1].items).toEqual(["Add daily streak badge (#101)"]);
  });

  test("ignores the title and intro above the first release", () => {
    const releases = parseChangelog(SAMPLE);
    expect(releases).toHaveLength(2);
    expect(
      releases.some(r => r.version.toLowerCase().includes("changelog")),
    ).toBe(false);
  });

  test("collects ungrouped items into a section with an empty heading", () => {
    const releases = parseChangelog("## [0.1.0]\n\n- Initial release\n");
    expect(releases[0].sections).toEqual([
      {
        heading: "",
        items: ["Initial release"],
      },
    ]);
  });

  test("returns no releases for an empty document", () => {
    expect(parseChangelog("")).toEqual([]);
  });
});
