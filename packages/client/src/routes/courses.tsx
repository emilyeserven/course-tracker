import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/courses")({
  component: Courses,
});

interface Course {
  name: string;
  key: string;
  link: string;
  topic: string;
}

export function Courses() {
  const localItem = localStorage.getItem("courseData");
  const local = JSON.parse(localItem ? localItem : "");
  console.log(local);
  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl">{local.name}&#39;s Courses</h1>
      <div className="grid grid-cols-3">
        {
          local.courses.map((course: Course) => {
            if (course.name === "") {
              return;
            }
            return (
              <div
                key={course.key}
                className="rounded border p-2"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-2xl">{course.name}</h3>
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
              </div>
            );
          })
        }
      </div>
    </div>
  );
}
