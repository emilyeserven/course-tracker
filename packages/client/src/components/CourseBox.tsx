import type { Course } from "@emstack/types/src";

import { Link } from "@tanstack/react-router";
import {
  CheckCheckIcon,
  CheckCircle,
  DollarSignIcon,
  ExternalLink,
  PauseCircle,
  PlayCircle,
  TimerIcon,
} from "lucide-react";

import { CourseMetaItem } from "@/components/CourseMetaItem";
import { TopicList } from "@/components/TopicList";

export function CourseBox({
  status,
  id,
  provider,
  url,
  name,
  topics,
  dateExpires,
  description,
  progressCurrent = 0,
  progressTotal = 0,
  cost,
}: Course) {
  const costValue = cost.isCostFromPlatform
    ? `${(Number(cost.cost) / cost.splitBy)}*`
    : Number(cost.cost);
  return (
    <div
      className="flex flex-col justify-between gap-2 rounded border"
    >
      <div
        className={`
          flex flex-row items-center justify-between border-b bg-border px-2
          py-1
        `}
      >
        <div className="flex flex-row items-center gap-2">
          <div>
            {status && status === "inactive" && (
              <PauseCircle size={16} />
            )}
            {status && status === "active" && (
              <PlayCircle size={16} />
            )}
            {status && status === "complete" && (
              <CheckCircle size={16} />
            )}
          </div>
          <TopicList topics={topics} />
          <div className="flex flex-row gap-1" />
        </div>

        {url && (
          <a
            href={url}
            target="_blank"
            className="cursor-pointer"
            rel="noopener noreferrer"
          >
            <ExternalLink size={16} />
          </a>
        )}
      </div>
      <div className="flex h-full flex-col justify-between">
        <div className="flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between px-2 pt-1">
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-2xl">
                <Link
                  to="/courses/$id"
                  from="/courses"
                  params={{
                    id: id + "",
                  }}
                  className="hover:text-blue-600"
                >{name}
                </Link>
              </h3>
              { provider && <h4>From {provider}</h4> }
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
          value={dateExpires}
          condition={!!dateExpires}
          iconNode={<TimerIcon size={16} />}
          emptyText="No course expiry given"
        />
        <CourseMetaItem
          value={progressCurrent && progressTotal ? `${progressCurrent} / ${progressTotal}` : 0}
          condition={!!progressCurrent && !!progressTotal}
          iconNode={<CheckCheckIcon size={16} />}
          emptyText="No progress"
        />
        <CourseMetaItem
          value={costValue}
          condition={!!cost.cost}
          iconNode={<DollarSignIcon size={16} />}
          emptyText="No cost given"
        />
      </div>
      {progressCurrent > 0 && (
        <div className="-mt-2 w-full rounded-br bg-gray-50">
          <div
            className={`
              ${status && status === "inactive"
          ? "bg-primary/50"
          : "bg-primary"}
              h-2 rounded-bl
            `}
            style={{
              width: `${progressCurrent !== 0 ? progressTotal / progressCurrent : 0}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
