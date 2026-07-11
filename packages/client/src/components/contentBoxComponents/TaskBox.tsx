import type { Task } from "@emstack/types";

import { isTodoComplete } from "@emstack/types";
import { Link } from "@tanstack/react-router";
import { CalendarIcon, CheckSquareIcon } from "lucide-react";

import { CourseMetaItem, Description } from "@/components/boxElements";
import {
  ContentBox,
  ContentBoxBody,
  ContentBoxFooter,
  ContentBoxHeader,
  ContentBoxTitle,
} from "@/components/contentBoxComponents/ContentBox";

export function TaskBox({
  id, name, description, dueDate, todos,
}: Task) {
  const totalTodos = todos?.length ?? 0;
  const doneTodos = todos?.filter(t => isTodoComplete(t.status)).length ?? 0;

  return (
    <ContentBox>
      <ContentBoxHeader>
        <ContentBoxTitle>
          <h3 className="text-xl">
            <Link
              to="/tasks/$id"
              params={{
                id,
              }}
              className="hover:text-blue-600"
            >
              {name}
            </Link>
          </h3>
        </ContentBoxTitle>
      </ContentBoxHeader>
      <ContentBoxBody>
        <Description description={description} />
      </ContentBoxBody>
      <ContentBoxFooter>
        <CourseMetaItem
          value={`${doneTodos} / ${totalTodos} to-dos done`}
          condition={true}
          iconNode={<CheckSquareIcon size={16} />}
          emptyText="No to-dos"
        />
        <CourseMetaItem
          value={dueDate ? `Due ${dueDate}` : ""}
          condition={!!dueDate}
          iconNode={<CalendarIcon size={16} />}
          emptyText=""
        />
      </ContentBoxFooter>
    </ContentBox>
  );
}
