import type { Course } from "@/routes/courses";

import { CheckCircle, ExternalLink, PauseCircle, PlayCircle } from "lucide-react";

import { CourseMetaItem } from "@/components/CourseMetaItem";

export function CourseBox({
  key,
  status,
  link,
  name,
  topic,
  dateExpires,
  progressCurrent,
  progressTotal,
  cost,
}: Course) {
  return (
    <div
      key={key}
      className="flex flex-col justify-between gap-2 rounded border"
    >
      <div className="flex items-start justify-between px-2 pt-1">
        <div className="flex flex-row items-start gap-2">
          <div className="mt-2">
            {status && status === "inactive" && (
              <PauseCircle size={20} />
            )}
            {status && status === "active" && (
              <PlayCircle size={20} />
            )}
            {status && status === "complete" && (
              <CheckCircle size={20} />
            )}
          </div>
          <h3 className="text-2xl">{name}</h3>
        </div>
        {link && (
          <a
            href={link}
            target="_blank"
            className="mt-1.5 cursor-pointer"
            rel="noopener noreferrer"
          >
            <ExternalLink size={16} />
          </a>
        )}
      </div>
      <div className="px-2">
        <p>{topic}</p>
      </div>
      <div
        className={`
          flex flex-row flex-wrap justify-between gap-8 gap-y-1 px-2 pb-2
        `}
      >
        <CourseMetaItem
          value={dateExpires}
          condition={!!dateExpires}
          icon="timer"
          emptyText="No course expiry given"
        />
        <CourseMetaItem
          value={progressCurrent && progressTotal ? `${progressCurrent} / ${progressTotal}` : 0}
          condition={!!progressCurrent && !!progressTotal}
          icon="check-check"
          emptyText="No progress"
        />
        <CourseMetaItem
          value={cost}
          condition={!!cost}
          icon="dollar-sign"
          emptyText="No cost given"
        />
      </div>
      {
        !!progressCurrent && progressTotal && progressCurrent !== 0 && (progressTotal / progressCurrent) !== 0 && (
          <div className="bg-secondary -mt-1 w-full rounded-br">
            <div
              className={`
                ${status && status === "inactive"
            ? "bg-primary/50"
            : "bg-primary"}
                h-2 rounded-bl
              `}
              style={{
                width: `${progressTotal / progressCurrent}%`,
              }}
            />
          </div>
        )
      }
    </div>
  );
}
