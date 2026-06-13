import type { EntityKind } from "@/components/boxElements/EntityLink";
import type { TopConnectedItem } from "@/utils/topConnected";
import type { LucideIcon } from "lucide-react";

import { Link } from "@tanstack/react-router";

import { EntityLink } from "@/components/boxElements/EntityLink";
import { ContentBox } from "@/components/contentBoxComponents/ContentBox";
import { cn } from "@/lib/utils";

export interface OverviewCardItem {
  to: React.ComponentProps<typeof Link>["to"];
  title: string;
  description: string;
  icon: LucideIcon;
  // The entity kind the top-connected pills link to. Omit for a plain tile.
  entity?: EntityKind;
  // The already-ranked top 3 most-connected items of this tile's type.
  topConnected?: TopConnectedItem[];
}

function OverviewCard({
  to,
  title,
  description,
  icon: Icon,
  entity,
  topConnected,
}: OverviewCardItem) {
  return (
    <ContentBox className="h-full gap-0 overflow-hidden p-0">
      <Link
        to={to}
        className="
          group flex flex-1 flex-col justify-start gap-3 p-5 transition-colors
          hover:bg-accent hover:text-accent-foreground
        "
      >
        <Icon
          className="
            size-7 text-muted-foreground
            group-hover:text-accent-foreground
          "
        />
        <span className="text-lg font-medium">{title}</span>
        <p
          className="
            text-sm text-muted-foreground
            group-hover:text-accent-foreground
          "
        >
          {description}
        </p>
      </Link>
      {entity && topConnected && topConnected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-5 pb-5">
          {topConnected.map(item => (
            <EntityLink
              key={item.id}
              entity={entity}
              id={item.id}
              className="
                rounded-sm bg-gray-50 px-2 py-0.5 text-xs
                hover:bg-gray-900 hover:text-white
              "
            >
              {item.name}
            </EntityLink>
          ))}
        </div>
      )}
    </ContentBox>
  );
}

export function OverviewCardGrid({
  items,
  className,
}: {
  items: OverviewCardItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        `
          grid w-full grid-cols-1 gap-4 gap-y-6
          sm:grid-cols-2
          md:grid-cols-3
        `,
        className,
      )}
    >
      {items.map(item => (
        <OverviewCard
          key={item.title}
          {...item}
        />
      ))}
    </div>
  );
}
