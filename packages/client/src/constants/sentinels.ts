/**
 * Placeholder id assigned to an unsaved "new row" draft before it is persisted.
 * It is only ever written onto a draft's `id`; newness is read from a separate
 * `isNew` flag, never by comparing against this value.
 */
export const NEW_ROW_ID = "__new__";
