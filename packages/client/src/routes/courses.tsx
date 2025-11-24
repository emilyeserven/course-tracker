import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/courses")({
  component: Courses,
});

export interface Course {
  name: string;
  id: string;
  link: string;
  topic: string;
  service?: string;
  description?: string;
  progressCurrent?: number;
  progressTotal?: number;
  status?: "active" | "inactive" | "complete";
  dateExpires?: string;
  cost?: string;
}

export function Courses() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
