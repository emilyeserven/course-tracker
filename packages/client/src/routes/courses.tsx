import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCheck,
  CheckCircle,
  Circle,
  DollarSign,
  ExternalLink,
  PauseCircle,
  Timer,
} from "lucide-react";

export const Route = createFileRoute("/courses")({
  component: Courses,
});

interface Course {
  name: string;
  key: string;
  link: string;
  topic: string;
  progressCurrent?: number;
  progressTotal?: number;
  status?: "active" | "inactive" | "complete";
  dateExpires?: string;
  cost?: string;
}

export function Courses() {
  const localItem = localStorage.getItem("courseData");
  const local = JSON.parse(localItem ? localItem : "");
  console.log("lI", localItem);
  console.log("l", local);
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">{local.name}&#39;s Courses</h1>
      <div className="grid grid-cols-3 gap-2">
        {
          local.courses.map((course: Course) => {
            if (course.name === "") {
              return;
            }
            return (
              <div
                key={course.key}
                className="flex flex-col gap-2 rounded border p-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-row items-center gap-2">
                    {course.status && course.status === "inactive" && (
                      <PauseCircle size={20} />
                    )}
                    {course.status && course.status === "active" && (
                      <Circle size={20} />
                    )}
                    {course.status && course.status === "complete" && (
                      <CheckCircle size={20} />
                    )}
                    <h3 className="text-2xl">{course.name}</h3>
                  </div>
                  <a
                    href={course.link}
                    target="_blank"
                    className="cursor-pointer"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
                <p>{course.topic}</p>
                <div className="flex flex-row gap-8">
                  <div className="flex flex-row items-center gap-1">
                    <Timer size={16} />
                    {course?.dateExpires
                      ? course.dateExpires
                      : (
                        <i
                          className="text-sm"
                        >No course expiry given
                        </i>
                      )}
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <CheckCheck size={16} />
                    {course?.progressCurrent && course?.progressTotal
                      ? `${course.progressCurrent} / ${course.progressTotal}`
                      : (
                        <i
                          className="text-sm"
                        >No progress
                        </i>
                      )}
                  </div>
                  <div className="flex flex-row items-center">
                    <DollarSign size={16} />
                    {course?.cost
                      ? `${course.cost}`
                      : (
                        <i
                          className="text-sm"
                        >No cost given
                        </i>
                      )}
                  </div>
                </div>
                {
                  course.progressCurrent && course.progressTotal && (
                    <div className="bg-secondary mt-2 w-full">
                      <div
                        className={`
                          ${course?.status && course.status === "inactive"
                      ? "bg-primary/50"
                      : "bg-primary"}
                          h-1 rounded
                        `}
                        style={{
                          width: `${course.progressTotal / course.progressCurrent}%`,
                        }}
                      />
                    </div>
                  )
                }
              </div>
            );
          })
        }
      </div>
    </div>
  );
}
