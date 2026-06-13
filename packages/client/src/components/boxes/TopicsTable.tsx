import type { TopicForTopicsPage } from "@emstack/types";

import { useMemo } from "react";

import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";

import { EntityLink } from "@/components/boxElements/EntityLink";
import { SelectAllCheckbox } from "@/components/ui/SelectAllCheckbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type TopicsTableSortColumn
  = | "name"
    | "domains"
    | "resources"
    | "tasks"
    | "dailies";
export type TopicsTableSortDirection = "asc" | "desc";

export interface TopicsTableSort {
  column: TopicsTableSortColumn;
  direction: TopicsTableSortDirection;
}

interface TopicsTableSelection {
  selectedIds: Set<string>;
  onToggleSelected: (id: string) => void;
  onToggleAll: (selectAll: boolean) => void;
}

interface TopicsTableSortControl {
  sort?: TopicsTableSort;
  onSortChange?: (sort: TopicsTableSort) => void;
}

interface TopicsTableProps extends TopicsTableSortControl {
  topics: TopicForTopicsPage[];
  selection?: TopicsTableSelection;
}

interface SortableHeaderProps extends TopicsTableSortControl {
  column: TopicsTableSortColumn;
  label: string;
  align?: "left" | "right";
}

function SortableHeader({
  column,
  label,
  sort,
  onSortChange,
  align = "left",
}: SortableHeaderProps) {
  const headClassName = cn(
    "whitespace-nowrap",
    align === "right" ? "text-right" : undefined,
  );

  if (!onSortChange) {
    return <TableHead className={headClassName}>{label}</TableHead>;
  }

  const isActive = sort?.column === column;
  const direction = isActive ? sort.direction : undefined;
  const ariaSort = isActive
    ? direction === "asc" ? "ascending" : "descending"
    : "none";

  const handleClick = () => {
    if (isActive) {
      onSortChange({
        column,
        direction: direction === "asc" ? "desc" : "asc",
      });
    }
    else {
      onSortChange({
        column,
        direction: column === "name" || column === "domains" ? "asc" : "desc",
      });
    }
  };

  return (
    <TableHead
      aria-sort={ariaSort}
      className={headClassName}
    >
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          `
            inline-flex items-center gap-1 text-xs font-semibold
            text-muted-foreground uppercase transition-colors
            hover:text-foreground
            focus-visible:rounded-sm focus-visible:outline-2
            focus-visible:outline-offset-2 focus-visible:outline-ring
          `,
          align === "right" ? "justify-end" : "justify-start",
        )}
      >
        <span>{label}</span>
        {isActive && direction === "asc" && (
          <ArrowUpIcon
            className="size-3.5"
            aria-hidden="true"
          />
        )}
        {isActive && direction === "desc" && (
          <ArrowDownIcon
            className="size-3.5"
            aria-hidden="true"
          />
        )}
        {!isActive && (
          <ArrowUpDownIcon
            className="size-3.5 opacity-40"
            aria-hidden="true"
          />
        )}
      </button>
    </TableHead>
  );
}

export function TopicsTable({
  topics,
  selection,
  sort,
  onSortChange,
}: TopicsTableProps) {
  const selectedIds = selection?.selectedIds;

  const allSelected = useMemo(() => {
    if (!selectedIds || topics.length === 0) return false;
    return topics.every(t => selectedIds.has(t.id));
  }, [topics, selectedIds]);

  const someSelected = useMemo(() => {
    if (!selectedIds) return false;
    return topics.some(t => selectedIds.has(t.id));
  }, [topics, selectedIds]);

  return (
    <div className="w-full rounded-md border bg-card">
      <Table className="w-auto min-w-full">
        <TableHeader>
          <TableRow>
            {selection && (
              <TableHead className="w-10">
                <SelectAllCheckbox
                  className="size-4"
                  aria-label="Select all topics"
                  checked={allSelected}
                  indeterminate={!allSelected && someSelected}
                  onCheckedChange={selection.onToggleAll}
                />
              </TableHead>
            )}
            <SortableHeader
              column="name"
              label="Name"
              sort={sort}
              onSortChange={onSortChange}
            />
            <SortableHeader
              column="domains"
              label="Domains"
              sort={sort}
              onSortChange={onSortChange}
            />
            <TableHead>Description</TableHead>
            <SortableHeader
              column="resources"
              label="Resources"
              sort={sort}
              onSortChange={onSortChange}
              align="right"
            />
            <SortableHeader
              column="tasks"
              label="Tasks"
              sort={sort}
              onSortChange={onSortChange}
              align="right"
            />
            <SortableHeader
              column="dailies"
              label="Dailies"
              sort={sort}
              onSortChange={onSortChange}
              align="right"
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {topics.map((topic) => {
            const isSelected = selectedIds?.has(topic.id) ?? false;
            return (
              <TableRow
                key={topic.id}
                data-state={isSelected ? "selected" : undefined}
              >
                {selection && (
                  <TableCell className="w-10">
                    <input
                      type="checkbox"
                      className="size-4"
                      aria-label={`Select ${topic.name}`}
                      checked={isSelected}
                      onChange={() => selection.onToggleSelected(topic.id)}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium whitespace-nowrap">
                  <EntityLink
                    entity="topics"
                    id={topic.id}
                    className="hover:text-blue-600"
                  >
                    {topic.name}
                  </EntityLink>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {topic.domains
                    && topic.domains.filter(d => d.id !== undefined).length > 0
                    ? (
                      <div className="flex flex-wrap gap-1">
                        {topic.domains
                          .filter(domain => domain.id !== undefined)
                          .map(domain => (
                            <span
                              key={domain.id}
                              className="
                                rounded-sm bg-gray-100 px-2 py-0.5 text-xs
                                text-gray-700
                              "
                            >
                              {domain.title}
                            </span>
                          ))}
                      </div>
                    )
                    : (
                      <span className="text-muted-foreground">—</span>
                    )}
                </TableCell>
                <TableCell className="max-w-md">
                  {topic.description
                    ? (
                      <span className="line-clamp-2 text-sm">
                        {topic.description}
                      </span>
                    )
                    : (
                      <span className="text-muted-foreground">—</span>
                    )}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {topic.resourceCount ?? 0}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {topic.taskCount ?? 0}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {topic.dailyCount ?? 0}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
