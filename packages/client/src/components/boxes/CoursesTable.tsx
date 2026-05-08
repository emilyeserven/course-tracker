import type { CourseInCourses } from "@emstack/types/src";

import { Link } from "@tanstack/react-router";
import {
  CalendarCheckIcon,
  ExternalLink,
  ExternalLinkIcon,
} from "lucide-react";

import { EntityLink } from "@/components/boxElements/EntityLink";
import { StatusIndicator } from "@/components/boxElements/StatusIndicator";
import { TopicList } from "@/components/boxElements/TopicList";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CoursesTableProps {
  courses: CourseInCourses[];
}

function formatProgress(course: CourseInCourses): string {
  if (!course.progressTotal) return "—";
  const pct = Math.round(
    (course.progressCurrent / course.progressTotal) * 100,
  );
  return `${course.progressCurrent} / ${course.progressTotal} (${pct}%)`;
}

function formatCost(course: CourseInCourses): string {
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Status</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Topics</TableHead>
            <TableHead>Daily</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="w-12 text-right">Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map(course => (
            <TableRow key={course.id}>
              <TableCell>
                <StatusIndicator status={course.status} />
              </TableCell>
              <TableCell className="font-medium">
                <EntityLink
                  entity="courses"
                  id={course.id}
                  className="hover:text-blue-600"
                >
                  {course.name}
                </EntityLink>
              </TableCell>
              <TableCell>
                {course.provider
                  ? (
                    <EntityLink
                      entity="providers"
                      id={course.provider.id}
                      from="/courses"
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
              <TableCell>
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
              <TableCell>
                {course.dailies && course.dailies.length > 0
                  ? (
                    <Link
                      to="/dailies/$id"
                      params={{
                        id: course.dailies[0].id,
                      }}
                      title={`Open Daily: ${course.dailies[0].name}`}
                      className={`
                        inline-flex items-center gap-1 text-xs text-blue-700
                        hover:text-blue-500
                        dark:text-blue-300
                      `}
                    >
                      <CalendarCheckIcon className="size-3.5" />
                      <span className="max-w-32 truncate">
                        {course.dailies[0].name}
                      </span>
                      <ExternalLinkIcon className="size-3" />
                    </Link>
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
              <TableCell className="text-right">
                {course.url
                  ? (
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        inline-flex items-center text-muted-foreground
                        hover:text-foreground
                      "
                    >
                      <ExternalLink size={16} />
                    </a>
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
