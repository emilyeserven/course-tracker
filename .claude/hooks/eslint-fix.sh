#!/usr/bin/env bash
# PostToolUse hook (Edit|Write): auto-fix the edited file with ESLint so agent
# edits match the repo's stylistic rules (e.g. better-tailwindcss class
# wrapping) instead of being rewritten later by the pre-commit hook.
set -euo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}"

file_path=$(jq -r '.tool_input.file_path // empty')

case "$file_path" in
  *.js | *.jsx | *.mjs | *.cjs | *.ts | *.tsx) ;;
  *) exit 0 ;;
esac

# Skip silently when deps aren't installed or the file vanished.
[ -d node_modules ] || exit 0
[ -f "$file_path" ] || exit 0

pnpm exec eslint --fix --cache --cache-location node_modules/.cache/eslint/ \
  --cache-strategy content --no-warn-ignored "$file_path" || true
