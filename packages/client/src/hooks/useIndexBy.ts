import { useMemo } from "react";

function indexBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T> {
  const map = new Map<string, T>();
  items.forEach(item => map.set(keyFn(item), item));
  return map;
}

export function useIndexById<T extends { id: string }>(items: T[]): Map<string, T> {
  return useMemo(() => indexBy(items, i => i.id), [items]);
}

export function useIndexByLowerName<T extends { name: string }>(items: T[]): Map<string, T> {
  return useMemo(() => indexBy(items, i => i.name.toLowerCase()), [items]);
}
