import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { DailyCadenceBadge } from "./DailyCadenceBadge";

import { makeDaily } from "@/test-utils/dailiesFixtures";

describe("DailyCadenceBadge", () => {
  test("shows 'Daily' for daily-mode routines", () => {
    render(
      <DailyCadenceBadge
        daily={makeDaily({
          mode: "daily",
        })}
      />,
    );
    expect(screen.getByText("Daily")).toBeInTheDocument();
  });

  test("shows 'Weekly' for weekly-mode routines", () => {
    render(
      <DailyCadenceBadge
        daily={makeDaily({
          mode: "weekly",
        })}
      />,
    );
    expect(screen.getByText("Weekly")).toBeInTheDocument();
  });

  test("renders via Pill, keeping the rounded-full base", () => {
    render(
      <DailyCadenceBadge
        daily={makeDaily({
          mode: "daily",
        })}
      />,
    );
    expect(screen.getByText("Daily").className).toContain("rounded-full");
  });
});
