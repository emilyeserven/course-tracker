/** Anything carrying an optional page range — both `Module` and `ModuleGroup`. */
export interface PageRanged {
  pageStart?: number | null;
  pageEnd?: number | null;
}

/**
 * Stable sort by `pageStart` ascending, tie-broken by `pageEnd`, with items that
 * have no `pageStart` (null/undefined) sorted last. Returns a new array; items
 * with equal page keys — including a list where nothing has page numbers — keep
 * their original relative order, so this degrades to a no-op for unpaged lists.
 *
 * Used to present a book resource's modules/groups in reading (page) order while
 * leaving everything else in its existing position/name order.
 */
export function sortByPage<T extends PageRanged>(items: T[]): T[] {
  return items
    .map((item, index) => ({
      item,
      index,
    }))
    .sort((a, b) => comparePage(a.item, b.item) || a.index - b.index)
    .map(({
      item,
    }) => item);
}

/** Compare two page ranges: pageStart asc, then pageEnd asc, nulls last. */
function comparePage(a: PageRanged, b: PageRanged): number {
  const startDiff = pageKey(a.pageStart) - pageKey(b.pageStart);
  if (startDiff !== 0) return startDiff;
  return pageKey(a.pageEnd) - pageKey(b.pageEnd);
}

/** Treat a missing page as +Infinity so paged items sort ahead of unpaged ones. */
function pageKey(page: number | null | undefined): number {
  return page == null ? Number.POSITIVE_INFINITY : page;
}
