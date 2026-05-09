import type { CourseProvider } from "@emstack/types/src";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { DashboardCard } from "@/components/boxes/DashboardCard";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchProviders } from "@/utils";

interface UnderutilizedProvider {
  provider: CourseProvider;
  cost: number;
  activeCount: number;
  inactiveCount: number;
  completeCount: number;
  amortization: number | null;
}

function parseCost(cost: CourseProvider["cost"]): number {
  if (cost == null || cost === "") return 0;
  const value = Number(cost);
  return Number.isFinite(value) ? value : 0;
}

function buildUnderutilized(
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

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function DashboardUnderutilizedProviders() {
  const {
    data: providers,
    isPending,
    error,
  } = useQuery({
    queryKey: ["providers"],
    queryFn: () => fetchProviders(),
  });

  const rows = buildUnderutilized(providers);

  return (
    <DashboardCard
      title="Underutilized Providers"
      action={
        <Link
          to="/providers"
          className="
            text-sm text-primary underline-offset-2
            hover:underline
          "
        >
          View all
        </Link>
      }
    >
      {isPending && (
        <p className="text-sm text-muted-foreground">Loading providers...</p>
      )}
      {error && (
        <p className="text-sm text-destructive">Failed to load providers.</p>
      )}
      {providers && rows.length === 0 && (
        <p className="text-sm text-muted-foreground">
          <i>No underutilized providers.</i>
        </p>
      )}
      {rows.length > 0 && (
        <div
          className="max-h-80 w-full overflow-auto [scrollbar-width:thin]"
        >
          <Table className="w-auto min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Provider</TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  Cost per Unit
                </TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  Inactive
                </TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  Complete
                </TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  Go
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(
                ({
                  provider, amortization, inactiveCount, completeCount,
                }) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      <Link
                        to="/providers/$id"
                        params={{
                          id: provider.id,
                        }}
                        className="hover:text-blue-600"
                      >
                        {provider.name}
                      </Link>
                    </TableCell>
                    <TableCell
                      className="text-right whitespace-nowrap"
                      title={
                        amortization === null
                          ? "No completed courses yet"
                          : undefined
                      }
                    >
                      {amortization === null
                        ? "—"
                        : formatCurrency(amortization)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {inactiveCount}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {completeCount}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a
                          href={provider.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Go
                          <ExternalLink />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </DashboardCard>
  );
}
