import { Link } from "@tanstack/react-router";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DailyEntityLinkProps {
  /** Both routes take a single `{ id }` param, so the union is param-compatible. */
  to: "/tasks/$id" | "/resources/$id";
  id: string;
  icon: React.ReactNode;
  tooltip: string;
  ariaLabel: string;
}

/**
 * A muted icon that links to a daily's linked task or resource, with a tooltip.
 * Shared by DailyTaskIndicator and DailyResourceIndicator — they differ only in
 * route, icon, and label.
 */
export function DailyEntityLink({
  to,
  id,
  icon,
  tooltip,
  ariaLabel,
}: DailyEntityLinkProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={to}
          params={{
            id,
          }}
          aria-label={ariaLabel}
          className="
            inline-flex items-center text-muted-foreground
            hover:text-foreground
          "
        >
          {icon}
        </Link>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
