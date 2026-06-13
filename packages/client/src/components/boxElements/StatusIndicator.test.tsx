import type { ResourceStatus } from "@emstack/types";

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { StatusIndicator } from "./StatusIndicator";

import { TooltipProvider } from "@/components/ui/tooltip";

function renderStatus(status: ResourceStatus) {
  return render(
    <TooltipProvider>
      <StatusIndicator status={status} />
    </TooltipProvider>,
  );
}

describe("StatusIndicator", () => {
  test.each(["active", "inactive", "complete"] as const)(
    "renders a tooltip trigger for the %s status",
    (status) => {
      renderStatus(status);
      // Each known status renders an icon inside a Radix tooltip trigger button.
      expect(screen.getByRole("button")).toBeInTheDocument();
    },
  );
});
