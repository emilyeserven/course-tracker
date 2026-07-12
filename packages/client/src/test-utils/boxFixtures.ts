import type {
  Routine,
  RoutineTodayAction,
  Task,
} from "@emstack/types";

/**
 * Mock-data builders for the `components/contentBoxComponents/*` stories. Each `make*` takes a
 * partial override and fills in sensible defaults, so a story only specifies the
 * fields it cares about.
 */

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    name: "Finish the tutorial project",
    description: "Build the sample app end to end.",
    ...overrides,
  };
}

export function makeRoutine(
  overrides: Partial<
    Routine & { todayAction?: RoutineTodayAction | null }
  > = {},
): Routine & { todayAction?: RoutineTodayAction | null } {
  return {
    id: "routine-1",
    name: "Daily reading",
    description: "Read for 20 minutes every day.",
    status: "active",
    mode: "daily",
    connections: [
      {
        type: "task",
        id: "task-1",
        name: "Read a chapter",
      },
    ],
    // A task on a few weekdays: keeps daily mode free of the "nothing assigned"
    // warning and gives weekly mode a populated day strip.
    weekly: {
      1: {
        type: "task",
        id: "task-1",
      },
      3: {
        type: "task",
        id: "task-1",
      },
      5: {
        type: "task",
        id: "task-1",
      },
    },
    // Fixed dates keep the fixture deterministic; stories assert on labels, not
    // the computed chain/total numbers (which depend on the current date).
    completions: [
      {
        date: "2026-06-10",
        status: "goal",
      },
      {
        date: "2026-06-11",
        status: "goal",
      },
      {
        date: "2026-06-12",
        status: "touched",
      },
    ],
    ...overrides,
  };
}
