# Client Checklist (React 19 / Radix UI / Tailwind CSS)

## React Patterns

- **Rules of Hooks**: Hooks called at top level only, not inside conditions/loops/callbacks
- **useEffect dependencies**: All referenced values in the dep array; no missing or unnecessary deps
- **useEffect cleanup**: Effects that subscribe, set timers, or add listeners must return a cleanup function
- **State mutations**: Never mutate React state directly — use the setter with a new reference. Watch for `array.push()`, `object.key = val`, `array.sort()` on state
- **Error Boundaries**: Risky subtrees wrapped in Error Boundaries with meaningful fallback UI
- **Component composition**: Prefer composition over prop-heavy monolithic components

## Forms

- **TanStack Form + Zod**: Forms use TanStack Form with Zod validation — not raw `useState` + `onChange`
- **Compound Field components**: Follow the existing Field component pattern for form inputs

## Data Fetching

- **Centralized fetch functions**: All API calls go through `utils/fetchFunctions.ts` — flag new hardcoded URLs or inline `fetch()` calls
- **Response checking**: Flag new fetch calls that skip `res.ok` checks (known debt — don't make it worse)

## UI Components

- **Shadcn pattern**: Components use Radix UI primitives + Tailwind CSS + CVA for variants
- **Icons**: Use `lucide-react` only — no other icon libraries
- **No inline styles**: Don't use `style={}` for things Tailwind handles
- **Consistent naming**: Follow existing component naming conventions in `components/ui/`

## General

- **Dead code**: No commented-out code, unused imports, unreachable branches
- **Magic numbers/strings**: Extract to named constants
- **Naming**: Variables/functions describe what they hold/do. Booleans start with `is`/`has`/`should`/`can`
- **Follow existing patterns**: Match the conventions already in the codebase rather than introducing new ones
