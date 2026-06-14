// One ranked entry shown as a pill inside an overview tile. `count` drives the
// ranking; the tiles render `name` only.
export interface TopConnectedItem {
  id: string;
  name: string;
  count: number;
}

// Rank a list by connection count and return the top `limit` entries. Items
// with no connections are dropped so a tile shows nothing rather than empty
// pills; ties break alphabetically by name for stable display. Pair with the
// per-type count formulas in ./connectionCounts to supply `getCount`.
export function topConnected<T extends { id: string }>(
  items: T[] | undefined,
  getName: (item: T) => string,
  getCount: (item: T) => number,
  limit = 3,
): TopConnectedItem[] {
  if (!items?.length) return [];

  return items
    .map(item => ({
      id: item.id,
      name: getName(item),
      count: getCount(item),
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}
