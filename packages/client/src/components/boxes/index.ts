// Barrel for the box / table components so a page that renders two or three of
// them imports from one module. Boxes import their siblings via direct file
// paths (never this index), so this re-export barrel introduces no cycle.
/* eslint-disable import/max-dependencies -- aggregator barrel; re-exports only */
export { ContentBox } from "./ContentBox";
export { CourseBox } from "./CourseBox";
export { CoursesTable } from "./CoursesTable";
export { DashboardCard } from "./DashboardCard";
export { DomainBox } from "./DomainBox";
export { OverviewCardGrid } from "./OverviewCardGrid";
export { ProviderBox } from "./ProviderBox";
export { RoutineBox } from "./RoutineBox";
export { TaskBox } from "./TaskBox";
export { TopicBox } from "./TopicBox";
export { TopicsTable, type TopicsTableSort } from "./TopicsTable";
