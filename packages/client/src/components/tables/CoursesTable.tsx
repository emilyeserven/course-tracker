import type { ResourceInResources } from "@emstack/types";
import type { ColumnDef } from "@tanstack/react-table";

import { ExternalLink } from "lucide-react";

import { EntityLink, StatusIndicator, TopicList } from "@/components/boxElements";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EmptyDash } from "@/components/ui/EmptyDash";

interface CoursesTableProps {
  courses: ResourceInResources[];
}

function formatProgress(course: ResourceInResources): string {
  if (!course.progressTotal) return "—";
  const pct = Math.round((course.progressCurrent / course.progressTotal) * 100);
  return `${course.progressCurrent} / ${course.progressTotal} (${pct}%)`;
}

function formatCost(course: ResourceInResources): string {
  const {
    cost,
  } = course;
  if (cost.cost == null) return "—";
  const value = cost.isCostFromPlatform
    ? Number(cost.cost) / cost.splitBy
    : Number(cost.cost);
  const suffix = cost.isCostFromPlatform ? "*" : "";
  return `$${value}${suffix}`;
}

const columns: ColumnDef<ResourceInResources>[] = [
  {
    id: "status",
    header: "Status",
    meta: {
      headClassName: "whitespace-nowrap",
    },
    cell: ({
      row,
    }) => <StatusIndicator status={row.original.status} />,
  },
  {
    id: "name",
    header: "Name",
    meta: {
      headClassName: "whitespace-nowrap",
      cellClassName: "font-medium whitespace-nowrap",
    },
    cell: ({
      row,
    }) => (
      <EntityLink
        entity="resources"
        id={row.original.id}
        className="hover:text-blue-600"
      >
        {row.original.name}
      </EntityLink>
    ),
  },
  {
    id: "provider",
    header: "Provider",
    meta: {
      headClassName: "whitespace-nowrap",
      cellClassName: "whitespace-nowrap",
    },
    cell: ({
      row,
    }) =>
      row.original.provider
        ? (
          <EntityLink
            entity="providers"
            id={row.original.provider.id}
            className="
              text-blue-800
              hover:text-blue-600
            "
          >
            {row.original.provider.name}
          </EntityLink>
        )
        : (
          <EmptyDash />
        ),
  },
  {
    id: "topics",
    header: "Topics",
    meta: {
      headClassName: "whitespace-nowrap",
      cellClassName: "whitespace-nowrap",
    },
    cell: ({
      row,
    }) =>
      row.original.topics && row.original.topics.length > 0
        ? (
          <TopicList
            topics={row.original.topics}
            isPills={false}
          />
        )
        : (
          <EmptyDash />
        ),
  },
  {
    id: "progress",
    header: "Progress",
    meta: {
      headClassName: "whitespace-nowrap",
      cellClassName: "whitespace-nowrap",
    },
    cell: ({
      row,
    }) => formatProgress(row.original),
  },
  {
    id: "cost",
    header: "Cost",
    meta: {
      headClassName: "whitespace-nowrap",
      cellClassName: "whitespace-nowrap",
    },
    cell: ({
      row,
    }) => formatCost(row.original),
  },
  {
    id: "expires",
    header: "Expires",
    meta: {
      headClassName: "whitespace-nowrap",
      cellClassName: "whitespace-nowrap",
    },
    cell: ({
      row,
    }) => row.original.dateExpires || <EmptyDash />,
  },
  {
    id: "link",
    header: "Link",
    meta: {
      align: "right",
      headClassName: "whitespace-nowrap",
      cellClassName: "whitespace-nowrap",
    },
    cell: ({
      row,
    }) =>
      row.original.url
        ? (
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a
              href={row.original.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Go
              <ExternalLink />
            </a>
          </Button>
        )
        : null,
  },
];

export function CoursesTable({
  courses,
}: CoursesTableProps) {
  return (
    <DataTable
      columns={columns}
      data={courses}
      getRowId={course => course.id}
      className="w-auto min-w-full"
      containerClassName="w-full rounded-md border bg-card"
    />
  );
}
