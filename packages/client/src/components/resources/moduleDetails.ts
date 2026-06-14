import type { Module } from "@emstack/types";

import { formatModuleLength } from "@emstack/types";

import { isHttpUrl } from "@/utils";

/**
 * Whether a module has anything to show in its details subpanel: a description,
 * a length, an http(s) url, or tags. Module rows are only expandable when this
 * is true — there's no point opening an empty panel.
 */
export function hasModuleDetails(m: Module): boolean {
  return Boolean(
    m.description
    || formatModuleLength(m.length)
    || (m.url && isHttpUrl(m.url))
    || (m.tags && m.tags.length > 0),
  );
}
