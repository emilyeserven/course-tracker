import type { RoutineWeekly } from "./Routine";

export interface RoutineTemplate {
  id: string;
  label: string;
  weekly: RoutineWeekly;
}
