import type { CourseProvider } from "@emstack/types";

import { parseCost } from "@/utils";

export interface UnderutilizedProvider {
  provider: CourseProvider;
  cost: number;
  activeCount: number;
  inactiveCount: number;
  completeCount: number;
  amortization: number | null;
}

export function buildUnderutilized(
  providers: CourseProvider[] | undefined,
): UnderutilizedProvider[] {
  if (!providers) return [];
  const rows: UnderutilizedProvider[] = [];
  for (const provider of providers) {
    const cost = parseCost(provider.cost);
    const activeCount = provider.activeCount ?? 0;
    if (cost <= 0 || activeCount > 0) continue;
    const completeCount = provider.completeCount ?? 0;
    rows.push({
      provider,
      cost,
      activeCount,
      inactiveCount: provider.inactiveCount ?? 0,
      completeCount,
      amortization: completeCount > 0 ? cost / completeCount : null,
    });
  }
  rows.sort((a, b) => {
    if (a.amortization === null && b.amortization === null) {
      return b.cost - a.cost;
    }
    if (a.amortization === null) return -1;
    if (b.amortization === null) return 1;
    return b.amortization - a.amortization;
  });
  return rows;
}
