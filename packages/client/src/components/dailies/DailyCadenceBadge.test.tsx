import type { Daily, RoutineMode } from "@emstack/types";

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { DailyCadenceBadge } from "./DailyCadenceBadge";

function makeDaily(mode: RoutineMode | null, name = "Morning reading"): Daily {
  return {
    id: "r1",
    name,
    completions: [],
    mode,
  };
}

describe("DailyCadenceBadge", () => {
  test("shows 'Daily' for daily-mode routines", () => {
    render(<DailyCadenceBadge daily={makeDaily("daily")} />);
    expect(screen.getByText("Daily")).toBeInTheDocument();
  });

  test("shows 'Weekly' for weekly-mode routines", () => {
    render(<DailyCadenceBadge daily={makeDaily("weekly")} />);
    expect(screen.getByText("Weekly")).toBeInTheDocument();
  });

  test("renders via Pill, keeping the rounded-full base", () => {
    render(<DailyCadenceBadge daily={makeDaily("daily")} />);
    expect(screen.getByText("Daily").className).toContain("rounded-full");
  });
});
