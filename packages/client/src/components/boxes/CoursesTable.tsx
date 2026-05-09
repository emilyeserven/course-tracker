import type { ResourceInResources } from "@emstack/types/src";

import { Link } from "@tanstack/react-router";
import {
  CalendarCheckIcon,
  ExternalLink,
} from "lucide-react";

import { EntityLink } from "@/components/boxElements/EntityLink";
import { StatusIndicator } from "@/components/boxElements/StatusIndicator";
import { TopicList } from "@/components/boxElements/TopicList";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CoursesTableProps {
  courses: ResourceInResources[];
}

function formatProgress(course: ResourceInResources): string {
  if (!course.progressTotal) return "—";
  const pct = Math.round(
    (course.progressCurrent / course.progressTotal) * 100,
  );
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

export function CoursesTable({
  courses,
}: CoursesTableProps) {
  return (
    <div className="w-full rounded-md border bg-card">
      <Table className="w-auto min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead className="whitespace-nowrap">Name</TableHead>
            <TableHead className="whitespace-nowrap">Provider</TableHead>
            <TableHead className="whitespace-nowrap">Topics</TableHead>
            <TableHead className="whitespace-nowrap">Daily</TableHead>
            <TableHead className="whitespace-nowrap">Progress</TableHead>
            <TableHead className="whitespace-nowrap">Cost</TableHead>
            <TableHead className="whitespace-nowrap">Expires</TableHead>
            <TableHead className="text-right whitespace-nowrap">Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map(course => (
            <TableRow key={course.id}>
              <TableCell>
                <StatusIndicator status={course.status} />
              </TableCell>
              <TableCell className="font-medium whitespace-nowrap">
                <EntityLink
                  entity="resources"
                  id={course.id}
                  className="hover:text-blue-600"
                >
                  {course.name}
                </EntityLink>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {course.provider
                  ? (
                    <EntityLink
                      entity="providers"
                      id={course.provider.id}
                      from="/resources"
                      className="
                        text-blue-800
                        hover:text-blue-600
                      "
                    >
                      {course.provider.name}
                    </EntityLink>
                  )
                  : (
                    <span className="text-muted-foreground">—</span>
                  )}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {course.topics && course.topics.length > 0
                  ? (
                    <TopicList
                      topics={course.topics}
                      isPills={false}
                    />
                  )
                  : (
                    <span className="text-muted-foreground">—</span>
                  )}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {course.dailies && course.dailies.length > 0
                  ? (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      asChild
                      title={`Open Daily: ${course.dailies[0].name}`}
                    >
                      <Link
                        to="/dailies/$id"
                        params={{
                          id: course.dailies[0].id,
                        }}
                      >
                        <CalendarCheckIcon />
                      </Link>
                    </Button>
                  )
                  : (
                    <span className="text-muted-foreground">—</span>
                  )}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatProgress(course)}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatCost(course)}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {course.dateExpires || (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                {course.url
                  ? (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
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
                  : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
