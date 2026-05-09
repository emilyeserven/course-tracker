// A task's link to a course (= future Resource), optionally narrowed to a
// module group or a single module within that course. At most one of
// moduleGroupId / moduleId is set; both null = the task targets the whole
// course.
export interface TaskResourceLink {
  courseId: string;
  course?: {
    id: string;
    name: string;
  } | null;
  moduleGroupId?: string | null;
  moduleGroup?: {
    id: string;
    name: string;
  } | null;
  moduleId?: string | null;
  module?: {
    id: string;
    name: string;
  } | null;
  position?: number | null;
}
