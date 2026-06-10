import type { LucideIcon } from "lucide-react";

import { Link } from "@tanstack/react-router";

import { ContentBox } from "@/components/boxes/ContentBox";
import { cn } from "@/lib/utils";

export interface OverviewCardItem {
  to: React.ComponentProps<typeof Link>["to"];
  title: string;
  description: string;
  icon: LucideIcon;
}

function OverviewCard({
  to, title, description, icon: Icon,
}: OverviewCardItem) {
  return (
    <Link
      to={to}
      className="group"
    >
      <ContentBox
        className="
          h-full justify-start gap-3 p-5 transition-colors
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
      </ContentBox>
    </Link>
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
      className={cn(`
        grid w-full grid-cols-1 gap-4 gap-y-6
        sm:grid-cols-2
        md:grid-cols-3
      `, className)}
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
