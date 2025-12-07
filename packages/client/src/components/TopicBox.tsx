import type { Topic } from "@emstack/types/src";

import { Link } from "@tanstack/react-router";
import {
  BookIcon,
} from "lucide-react";

import { CourseMetaItem } from "@/components/CourseMetaItem";

export function TopicBox({
  id,
  name,
  description,
  courseCount,
}: Topic) {
  return (
    <div
      className="flex flex-col justify-between gap-2 rounded border"
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between px-2 pt-1">
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-2xl">
                <Link
                  to="/topics/$id"
                  from="/topics"
                  params={{
                    id: id + "",
                  }}
                >{name}
                </Link>
              </h3>
            </div>
          </div>
          <div className="px-2 pb-2">
            <p>{description ? description : <i>No description provided.</i>}</p>
          </div>
        </div>
      </div>
      <div
        className={`
          flex flex-row flex-wrap justify-between gap-8 gap-y-1 border-t
          bg-gray-50 px-2 pt-2 pb-2
        `}
      >
        <CourseMetaItem
          value={courseCount}
          condition={true}
          iconNode={<BookIcon size={16} />}
        />
      </div>
    </div>
  );
}
