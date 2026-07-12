// Barrel for the box / table card components so a page that renders two or
// three of them imports from one module. Boxes import their siblings via
// direct file paths (never this index), so this re-export barrel adds no cycle.
export { RoutineBox } from "./RoutineBox";
export { TaskBox } from "./TaskBox";
