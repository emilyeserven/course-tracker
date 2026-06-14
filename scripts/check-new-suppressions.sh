#!/usr/bin/env bash
#
# Flag suppression/ignore directives ADDED by the current PR. Warn-only: this
# script emits GitHub workflow annotations (inline on the Files-changed tab) plus
# a markdown table to $GITHUB_STEP_SUMMARY, and always exits 0 — it never fails
# the check. Reviewers get visibility; legitimate suppressions aren't blocked.
#
# Detected (inline) directives:
#   - fallow:  // fallow-ignore-file | -next-line | -line <kind>
#   - eslint:  /* eslint-disable */, // eslint-disable-next-line, -line, etc.
#   - TS:      // @ts-ignore | @ts-nocheck | @ts-expect-error
#   - tests:   describe/it/test/context .skip|.only|.todo, xit/xdescribe/fit/fdescribe
#
# Scope: only JS/TS source files are scanned (via git pathspec), so generated
# output (**/dist/**, routeTree.gen.ts) and docs that merely *document* these
# patterns (.md) are never flagged.
#
# Usage: scripts/check-new-suppressions.sh <base-sha-or-ref>
#   The base is the PR target; the script diffs <base>...HEAD (merge-base form,
#   so only PR-introduced changes are considered). Requires full history
#   (checkout with fetch-depth: 0) so the base commit is reachable.
#
# Known limitations:
#   - Line-granular: moving or reindenting an existing directive reads as "added".
#   - Renamed files may re-flag directives they carry.
#   - Config-list growth (.fallowrc.json, pnpm.overrides, tsconfig excludes) is
#     out of scope — this only covers inline source directives.
#
set -euo pipefail

BASE="${1:?usage: check-new-suppressions.sh <base-sha-or-ref>}"
SUMMARY="${GITHUB_STEP_SUMMARY:-/dev/stdout}"

git diff --no-color --unified=0 "${BASE}...HEAD" -- \
  '*.ts' '*.tsx' '*.js' '*.jsx' '*.mjs' '*.cjs' \
  ':(exclude)**/dist/**' ':(exclude)**/routeTree.gen.ts' \
| awk -v summary="$SUMMARY" '
    # Track which file the current hunk belongs to.
    /^\+\+\+ b\// { file = substr($0, 7); next }

    # @@ -a,b +c,d @@  ->  new-file lines start at c.
    /^@@ / { match($0, /\+[0-9]+/); newline = substr($0, RSTART + 1, RLENGTH - 1) + 0; next }

    # Added lines (but not the +++ file header).
    /^\+/ && !/^\+\+\+/ {
      l = substr($0, 2); kind = ""
      if      (l ~ /fallow-ignore-(file|next-line|line)/)            kind = "fallow-ignore"
      else if (l ~ /eslint-disable/)                                 kind = "eslint-disable"
      else if (l ~ /@ts-(ignore|nocheck|expect-error)/)              kind = "ts-suppression"
      else if (l ~ /(describe|it|test|context)\.(skip|only|todo)|(xit|xdescribe|fit|fdescribe)\(/) kind = "test-skip/only"

      if (kind != "") {
        sub(/^[ \t]+/, "", l)            # trim leading whitespace for display
        gsub(/`/, "'\''", l)             # neutralize backticks so they do not break the table cell
        print "::warning file=" file ",line=" newline "::New " kind " directive added"
        rows = rows "| `" file "` | " newline " | " kind " | `" l "` |\n"
        count++
      }
      newline++                          # only added lines advance the counter (unified=0)
      next
    }

    END {
      if (count > 0)
        printf "## \xe2\x9a\xa0\xef\xb8\x8f New suppression directives (%d)\n\nThese were added by this PR. Warn-only \xe2\x80\x94 confirm each is justified; remove if not.\n\n| File | Line | Kind | Added line |\n|---|---|---|---|\n%s", count, rows > summary
      else
        print "## \xe2\x9c\x85 No new suppression directives added by this PR" > summary
    }
  '

exit 0
