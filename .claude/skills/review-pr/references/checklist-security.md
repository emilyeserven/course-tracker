# Security Checklist

## Active Checks

- **No raw SQL**: All queries must use Drizzle ORM parameterized queries — flag any `sql.raw()` or string-interpolated SQL
- **No committed secrets**: No `.env` files, API keys, tokens, database URLs, or hardcoded credentials in the diff
- **Input validation**: All user input validated via JSON Schema in middleware route definitions — no unvalidated request bodies or query params
- **No `dangerouslySetInnerHTML`**: Flag any usage unless explicitly sanitized
- **URL safety**: User-supplied values in URLs must be encoded; no string interpolation to build URLs with user data
- **CSRF basics**: Mutations use POST/PUT/DELETE (not GET)
- **Dependency additions**: New dependencies should be from well-maintained packages. Flag packages with no recent activity or very few downloads

## Known Gaps (Do Not Make Worse)

These are known security limitations of the project. PRs should not be blocked for their absence, but **flag any change that makes them worse**:

- **No authentication/authorization**: The app has no auth layer. Flag PRs that add sensitive data or operations without noting the auth gap
- **No rate limiting**: No request rate limiting on the API. Flag PRs adding public-facing or resource-intensive endpoints
- **Permissive CORS**: CORS in `app.ts` is broadly permissive. Flag PRs that expand CORS further or add new origins without justification
- **Missing `res.ok` checks**: Some fetch calls in `packages/client/src/utils/fetchFunctions.ts` don't check response status. Flag new fetch calls that repeat this pattern
