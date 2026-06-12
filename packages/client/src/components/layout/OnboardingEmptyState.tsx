import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface OnboardingEmptyStateProps {
  /** Empty-state heading, e.g. "No resources yet!". */
  message: string;
}

/**
 * Empty-state shown on list pages when there is no data: a short message and a
 * link to the onboarding flow.
 */
export function OnboardingEmptyState({
  message,
}: OnboardingEmptyStateProps) {
  return (
    <div className="flex flex-col gap-6">
      <i>{message}</i>

      <Link
        to="/onboard"
        className=""
      >
        <Button>
          Go to onboarding
          {" "}
          <ArrowRightIcon />
        </Button>
      </Link>
    </div>
  );
}
