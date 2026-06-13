import type { EntityKind } from "@/components/boxElements/EntityLink";

import { EntityLink } from "@/components/boxElements/EntityLink";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DailyEntityLinkProps {
  /** Which entity the daily links to — drives the route via EntityLink. */
  entity: Extract<EntityKind, "tasks" | "resources">;
  id: string;
  icon: React.ReactNode;
  tooltip: string;
  ariaLabel: string;
}

/**
 * A muted icon that links to a daily's linked task or resource, with a tooltip.
 * Shared by DailyTaskIndicator and DailyResourceIndicator — they differ only in
 * entity, icon, and label. The route + anchor come from the shared EntityLink.
 */
export function DailyEntityLink({
  entity,
  id,
  icon,
  tooltip,
  ariaLabel,
}: DailyEntityLinkProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <EntityLink
          entity={entity}
          id={id}
          aria-label={ariaLabel}
          className="
            inline-flex items-center text-muted-foreground
            hover:text-foreground
          "
        >
          {icon}
        </EntityLink>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
