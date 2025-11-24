import type { Course } from "@/routes/courses";

import { CheckCheck, CheckCircle, DollarSign, ExternalLink, PauseCircle, PlayCircle, Timer } from "lucide-react";

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
      className="flex flex-col gap-2 rounded border p-2"
    >
      <div className="flex items-start justify-between">
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
      <p>{topic}</p>
      <div className="flex flex-row flex-wrap justify-between gap-8 gap-y-1">
        <div className="flex flex-row items-center gap-1">
          <Timer size={16} />
          {dateExpires
            ? dateExpires
            : (
              <i
                className="text-sm"
              >No course expiry given
              </i>
            )}
        </div>
        <div className="flex flex-row items-center gap-2">
          <CheckCheck size={16} />
          {progressCurrent && progressTotal
            ? `${progressCurrent} / ${progressTotal}`
            : (
              <i
                className="text-sm"
              >No progress
              </i>
            )}
        </div>
        <div className="flex flex-row items-center">
          <DollarSign size={16} />
          {cost
            ? `${cost}`
            : (
              <i
                className="text-sm"
              >No cost given
              </i>
            )}
        </div>
      </div>
      {
        progressCurrent && progressTotal && (
          <div className="bg-secondary mt-2 w-full">
            <div
              className={`
                ${status && status === "inactive"
            ? "bg-primary/50"
            : "bg-primary"}
                h-1 rounded
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
