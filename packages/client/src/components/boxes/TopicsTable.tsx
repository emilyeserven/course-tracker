import type { TopicForTopicsPage } from "@emstack/types/src";

import { useMemo } from "react";

import { EntityLink } from "@/components/boxElements/EntityLink";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TopicsTableSelection {
  selectedIds: Set<string>;
  onToggleSelected: (id: string) => void;
  onToggleAll: (selectAll: boolean) => void;
}

interface TopicsTableProps {
  topics: TopicForTopicsPage[];
  selection?: TopicsTableSelection;
}

export function TopicsTable({
  topics,
  selection,
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
                <input
                  type="checkbox"
                  className="size-4"
                  aria-label="Select all topics"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = !allSelected && someSelected;
                  }}
                  onChange={e => selection.onToggleAll(e.target.checked)}
                />
              </TableHead>
            )}
            <TableHead className="whitespace-nowrap">Name</TableHead>
            <TableHead className="whitespace-nowrap">Domains</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right whitespace-nowrap">
              Resources
            </TableHead>
            <TableHead className="text-right whitespace-nowrap">
              Tasks
            </TableHead>
            <TableHead className="text-right whitespace-nowrap">
              Dailies
            </TableHead>
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
