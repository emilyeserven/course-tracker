import type { CourseInCourses } from "@emstack/types/src";

import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
  ExternalLink,
} from "lucide-react";

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
import { cn } from "@/lib/utils";
import { fetchCourses } from "@/utils";

type SortKey = "name" | "provider" | "cost" | "progress" | "amortization";
type SortDir = "asc" | "desc";

interface AmortizationRow {
  course: CourseInCourses;
  effectiveCost: number;
  progressCurrent: number;
  progressTotal: number;
  progressFraction: number;
  amortization: number | null;
  isUnstarted: boolean;
}

function parseCost(value: string | null | undefined): number {
  if (value == null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function buildRows(courses: CourseInCourses[] | undefined): AmortizationRow[] {
  if (!courses) return [];
  return courses.map((course) => {
    const rawCost = parseCost(course.cost?.cost);
    const splitBy
      = course.cost?.splitBy && course.cost.splitBy > 0 ? course.cost.splitBy : 1;
    const effectiveCost = rawCost / splitBy;
    const progressCurrent = course.progressCurrent ?? 0;
    const progressTotal = course.progressTotal ?? 0;
    const progressFraction
      = progressTotal > 0 ? progressCurrent / progressTotal : 0;
    const amortization
      = progressCurrent > 0 ? effectiveCost / progressCurrent : null;
    return {
      course,
      effectiveCost,
      progressCurrent,
      progressTotal,
      progressFraction,
      amortization,
      isUnstarted: progressCurrent === 0,
    };
  });
}

function compareRows(
  a: AmortizationRow,
  b: AmortizationRow,
  key: SortKey,
  dir: SortDir,
): number {
  const direction = dir === "asc" ? 1 : -1;
  let av: number | string;
  let bv: number | string;
  switch (key) {
    case "name":
      av = a.course.name.toLowerCase();
      bv = b.course.name.toLowerCase();
      break;
    case "provider":
      av = (a.course.provider?.name ?? "").toLowerCase();
      bv = (b.course.provider?.name ?? "").toLowerCase();
      break;
    case "cost":
      av = a.effectiveCost;
      bv = b.effectiveCost;
      break;
    case "progress":
      av = a.progressFraction;
      bv = b.progressFraction;
      break;
    case "amortization":
    default:
      // Treat unstarted (null) as the least amortized = highest cost-per-unit.
      av = a.amortization ?? Number.POSITIVE_INFINITY;
      bv = b.amortization ?? Number.POSITIVE_INFINITY;
      break;
  }
  if (av < bv) return -1 * direction;
  if (av > bv) return 1 * direction;
  return a.course.name.localeCompare(b.course.name);
}

export function DashboardCoursesByAmortization() {
  const {
    data: courses, isPending, error,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchCourses(),
  });

  const [showUnstarted, setShowUnstarted] = useState(false);
  // "least to most amortized" = highest cost-per-unit first.
  const [sortKey, setSortKey] = useState<SortKey>("amortization");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(key: SortKey) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir(key === "name" || key === "provider" ? "asc" : "desc");
      return;
    }
    setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
  }

  function sortIcon(key: SortKey) {
    if (sortKey !== key) {
      return <ChevronsUpDownIcon className="size-3 opacity-50" />;
    }
    return sortDir === "asc"
      ? <ChevronUpIcon className="size-3" />
      : <ChevronDownIcon className="size-3" />;
  }

  const rows = useMemo(() => {
    const all = buildRows(courses);
    const filtered = showUnstarted ? all : all.filter(r => !r.isUnstarted);
    return filtered.slice().sort((a, b) => compareRows(a, b, sortKey, sortDir));
  }, [courses, showUnstarted, sortKey, sortDir]);

  return (
    <DashboardCard
      title="Courses by Amortization"
      action={(
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={showUnstarted}
            onClick={() => setShowUnstarted(prev => !prev)}
            className="
              text-muted-foreground
              hover:text-foreground
              inline-flex items-center gap-2 text-xs
            "
          >
            <span
              className={cn(
                `
                  relative inline-flex h-4 w-7 items-center rounded-full
                  transition-colors
                `,
                showUnstarted ? "bg-primary" : "bg-input",
              )}
            >
              <span
                className={cn(
                  `
                    bg-background inline-block size-3 rounded-full shadow-sm
                    transition-transform
                  `,
                  showUnstarted ? "translate-x-3.5" : "translate-x-0.5",
                )}
              />
            </span>
            Show unstarted
          </button>
          <Link
            to="/courses"
            className="
              text-primary text-sm underline-offset-2
              hover:underline
            "
          >
            View all
          </Link>
        </div>
      )}
    >
      {isPending && (
        <p className="text-muted-foreground text-sm">Loading courses...</p>
      )}
      {error && (
        <p className="text-destructive text-sm">Failed to load courses.</p>
      )}
      {courses && rows.length === 0 && (
        <p className="text-muted-foreground text-sm">
          <i>No courses to show.</i>
        </p>
      )}
      {rows.length > 0 && (
        <div
          className="
            max-h-80 w-full overflow-auto rounded-md border
            [scrollbar-width:thin]
          "
        >
          <Table className="w-auto min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => toggleSort("name")}
                    className="
                      hover:text-foreground
                      inline-flex items-center gap-1
                    "
                  >
                    Course
                    {sortIcon("name")}
                  </button>
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => toggleSort("provider")}
                    className="
                      hover:text-foreground
                      inline-flex items-center gap-1
                    "
                  >
                    Provider
                    {sortIcon("provider")}
                  </button>
                </TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => toggleSort("cost")}
                    className="
                      hover:text-foreground
                      inline-flex items-center gap-1
                    "
                  >
                    Cost
                    {sortIcon("cost")}
                  </button>
                </TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => toggleSort("progress")}
                    className="
                      hover:text-foreground
                      inline-flex items-center gap-1
                    "
                  >
                    Progress
                    {sortIcon("progress")}
                  </button>
                </TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => toggleSort("amortization")}
                    className="
                      hover:text-foreground
                      inline-flex items-center gap-1
                    "
                  >
                    Amortization
                    {sortIcon("amortization")}
                  </button>
                </TableHead>
                <TableHead className="text-right whitespace-nowrap">Go</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({
                course,
                effectiveCost,
                progressCurrent,
                progressTotal,
                amortization,
                isUnstarted,
              }) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    <Link
                      to="/courses/$id"
                      params={{
                        id: course.id,
                      }}
                      className="hover:text-blue-600"
                    >
                      {course.name}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {course.provider
                      ? (
                        <Link
                          to="/providers/$id"
                          params={{
                            id: course.provider.id,
                          }}
                          className="
                            text-muted-foreground
                            hover:text-blue-600
                          "
                        >
                          {course.provider.name}
                        </Link>
                      )
                      : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {formatCurrency(effectiveCost)}
                  </TableCell>
                  <TableCell
                    className="text-right whitespace-nowrap"
                    title={
                      progressTotal > 0
                        ? `${progressCurrent} / ${progressTotal}`
                        : undefined
                    }
                  >
                    {progressTotal > 0
                      ? `${progressCurrent} / ${progressTotal}`
                      : progressCurrent}
                  </TableCell>
                  <TableCell
                    className="text-right whitespace-nowrap"
                    title={
                      isUnstarted
                        ? "Unstarted — no progress yet"
                        : undefined
                    }
                  >
                    {amortization === null
                      ? "—"
                      : formatCurrency(amortization)}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {course.url
                      ? (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                        >
                          <a
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Go
                            <ExternalLink />
                          </a>
                        </Button>
                      )
                      : (
                        <span className="text-muted-foreground">—</span>
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DashboardCard>
  );
}
