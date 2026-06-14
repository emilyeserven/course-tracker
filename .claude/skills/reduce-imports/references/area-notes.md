# reduce-imports — area notes

Per-issue worked examples and learnings for the [`reduce-imports`](../SKILL.md)
skill — what real passes turned up. **Illustrative reference, not steps to follow;**
the core procedure lives in `SKILL.md`.

The `#N` headings below are this repo's import/max-dependencies cleanup tracker
sub-issues — this is the per-tracker scratchpad, so issue numbers are expected
here. Add an entry when you finish an area.

## App shell & quick-add dialogs (#311)

Worked counts (non-type value imports): `routes/__root.tsx` = **12** (shed 2);
`components/quickAdd/QuickAddRoutineDialog.tsx` = **11** (shed 1);
`QuickAddTodoistDialog.tsx` = **11** (shed 1). Both dialogs cleared the line via
Strategy 2 (a per-dialog bundled hook); `__root` used Strategy 1 (a folder
barrel) **plus** Strategy 2 (a query hook).

### `queryKeys` is NOT in the `@/utils` barrel
`@/utils/queryKeys` is imported as its own line everywhere — it is deliberately
**not** re-exported from `utils/index.ts`. So `@/utils` + `@/utils/queryKeys` are
always two distinct sources you can't merge. The only way to drop the
`queryKeys` line from a component is to move the query/mutation logic that uses
it into a hook (Strategy 2). Don't try to "fix" this by adding it to the barrel —
that bloats the barrel's own dep count and fights the convention.

### Preserve query keys verbatim when extracting a query hook
Keys in this repo are inconsistent by accretion — some use the factory
(`queryKeys.resources.list()`), some are inline arrays (`["topics"]`,
`["providers"]`, `["domains"]`). When you lift `useQuery` calls into a hook
(e.g. `useShowOnboard` pulling the four onboarding fetches out of `__root`),
**copy each key exactly as-is**. "Tidying" an inline array into a factory call
while extracting silently breaks invalidation elsewhere that still uses the old
key. Behavior-preserving means key-preserving.

### Per-dialog bundled hook — the big collapse
A quick-add dialog drags in `react` (`useState`/`useEffect`) +
`@tanstack/react-query` (`useMutation`/`useQuery`/`useQueryClient`) +
`@tanstack/react-router` (`useNavigate`) + `sonner` + `@/utils` (the create fn) +
`@/utils/queryKeys` — **six** sources — purely to run one form+mutation. Fold all
of it into one `use…` hook returning a presentational-ready object
(`{ name, setName, mode, setMode, handleSubmit, isPending, canSubmit }`, with
`handleSubmit` owning `preventDefault` + trim-guard + `mutate`). The component is
left importing only render deps (a `lucide` icon, the form primitives,
`ui/button`, `ui/dialog`, the hook — and a `<Link>` if the JSX still navigates).

- **Placement:** the established home is `src/hooks/` (matches `useResourceModules`,
  `useDailyTracker`). A hook used by exactly one dialog may co-locate next to it
  (`components/quickAdd/useQuickAddRoutine.ts`) and stay **out** of the feature
  barrel — it's internal, not public surface. Either is fine; default to
  `src/hooks/` unless the hook is single-consumer and feature-private.
- `react`/`useState` only leaves the component if **all** its uses leave. In
  `__root` the `activeQuickAdd` state stays, so `react` stays — don't count it as
  shed.

### Folder barrel where none exists yet (Strategy 1, app-shell flavor)
`__root` imported two nav primitives by full path
(`@/components/layout/DropdownNavItem`, `…/NavDropdown`). There was no
`components/layout/index.ts`, so creating a cohesive one (export just the nav
set, not all ~13 layout files) merged them to a single `@/components/layout`
import. A barrel only pays off at ≥2 sources sharing a folder; re-exporting one
component buys nothing.

## Route layout + sections (settings, #308)

- **A route layout that renders N route-private sections → barrel the folder.**
  `foo.tsx` importing 10 `<XSection/>` from `foo.-components/-XSection.tsx`
  collapses to one import via a `foo.-components/index.ts` that
  `export { XSection } from "./-XSection"` for each. The un-prefixed `index.ts`
  is **router-safe** — the `.-` on the *folder* already excludes the whole
  directory from routing, so the barrel never becomes a route. Confirm with
  `pnpm --filter=@emstack/client run routeTree` (expect no diff). Generalizes
  #337's `dashboard.-components/index.ts`. Keep it cohesive: re-export just the
  route's own sections (stops at exactly the section count — no disable needed)
  rather than also folding in `@/components/*` chrome, which would push the
  barrel over 10 and force a scoped disable on it.

- **Colocate a route-private hook as `-use*.ts` inside the `.-components/`
  folder**, not `src/hooks/`, when only that route uses it (precedent:
  `dashboard.-components/-useDashboardDailies.ts`). Reserve `src/hooks/` for
  genuinely cross-route hooks (`useResourceModules`, `useEditFormPage`).

- **When extracting a hook, move the UI state its mutations reset.** Mutation
  `onSuccess` commonly calls component `setState` (close a dialog, clear a
  `*TargetId`/`creatingKind`). Move that state **into the hook** alongside the
  mutations and return `open*/close*/submit*` handlers plus `is*Pending` flags —
  otherwise the hook can't reset it and you'd have to thread setters back in.
  (`-useDashboardLayouts` owns its dialog-target + `creatingKind` state for
  exactly this reason.)

- **One hook can serve a parent + child split.** A section that's a thin
  fetch-wrapper around a form child: call the data/mutation hook once in the
  parent and pass the mutation **down as a prop**, rather than re-calling the
  hook (and re-importing react-query/utils) inside the child. (`FocusedDomains`:
  `useFocusedDomains()` in the section, `saveMutation` passed to the form.)

- **`lucide-react` is already one dependency** — multiple icons from it are one
  import line, so "consolidate the icons" advice is a no-op for the count. Look
  for whole *modules* to shed (react-query, sonner, `@/utils/api`,
  `@/utils/queryKeys`), which a hook absorbs in one move.
