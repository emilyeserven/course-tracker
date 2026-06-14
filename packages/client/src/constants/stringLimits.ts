/**
 * Client-side max lengths shared by text inputs and their zod `.max(...)`
 * validators so the two can't drift. These govern the client only — the
 * middleware/db may enforce its own limits.
 */
export const NAME_MAX_LENGTH = 255; // names / urls
export const TEXT_MAX_LENGTH = 500; // free-text notes / descriptions
