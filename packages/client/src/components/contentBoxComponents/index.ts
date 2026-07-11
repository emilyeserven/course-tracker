// Barrel for the box / table card components so a page that renders two or
// three of them imports from one module. Boxes import their siblings via
// direct file paths (never this index), so this re-export barrel adds no cycle.
export { ContentBox } from "./ContentBox";
export { CourseBox } from "./CourseBox";
export { ProviderBox } from "./ProviderBox";
export { RoutineBox } from "./RoutineBox";
export { TaskBox } from "./TaskBox";
export { TopicBox } from "./TopicBox";
export { CoursesTable } from "@/components/tables/CoursesTable";
export {
  TopicsTable,
  type TopicsTableSort,
} from "@/components/tables/TopicsTable";
