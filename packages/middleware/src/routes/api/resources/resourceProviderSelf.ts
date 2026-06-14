// Helpers for the "resource is its own provider" feature. A self-provider is a
// separate courseProviders row that shares the resource's id and mirrors its
// title (name) + location (url). Kept free of `@/` alias imports so the unit
// tests can load it under `node --test` (same convention as the *Rows.ts files).

export interface SelfProviderBody {
  name: string;
  url?: string | null;
  providerIsSelf?: boolean;
  courseProviderId?: string | null;
}

/**
 * A provider's url is required, and a self-provider mirrors the resource's url,
 * so the resource must have a url before it can be its own provider. Returns an
 * error message to abort the upsert with, or null when the body is valid.
 */
export function selfProviderError(body: SelfProviderBody): string | null {
  return body.providerIsSelf && !body.url
    ? "A resource URL is required to use it as its own provider."
    : null;
}

/**
 * The course-provider FK to persist on the resource row. A self-provider shares
 * the resource's id, so the FK points at the resource id itself; otherwise it's
 * the explicitly selected provider (or null when none is chosen).
 */
export function resolveCourseProviderId(
  body: SelfProviderBody,
  id: string,
): string | null {
  return body.providerIsSelf ? id : (body.courseProviderId ?? null);
}
