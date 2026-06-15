// The display label for a routine day entry that points at a resource. A day may
// narrow the resource to a specific module or a whole module group; when it does,
// that narrower name stands in for the resource name. Precedence: module name →
// group name → resource name. Empty/missing names fall through to the next. Used
// by both the client (live schedule rendering) and the middleware (completion
// baking) so the two never drift.
export function resourceEntryLabel(opts: {
  resourceName: string;
  moduleName?: string | null;
  groupName?: string | null;
}): string {
  return opts.moduleName || opts.groupName || opts.resourceName;
}
