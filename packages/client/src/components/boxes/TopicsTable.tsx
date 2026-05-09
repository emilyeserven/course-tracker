import type { TopicForTopicsPage } from "@emstack/types/src";

import { EntityLink } from "@/components/boxElements/EntityLink";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TopicsTableProps {
  topics: TopicForTopicsPage[];
}

export function TopicsTable({
  topics,
}: TopicsTableProps) {
  return (
    <div className="w-full rounded-md border bg-card">
      <Table className="w-auto min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Name</TableHead>
            <TableHead className="whitespace-nowrap">Domains</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right whitespace-nowrap">
              Courses
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
          {topics.map(topic => (
            <TableRow key={topic.id}>
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
                {topic.domains && topic.domains.length > 0
                  ? (
                    <div className="flex flex-wrap gap-1">
                      {topic.domains.map(domain => (
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
