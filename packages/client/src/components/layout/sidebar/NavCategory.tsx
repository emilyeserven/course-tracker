import type { NavCategory as NavCategoryConfig } from "./navConfig";
import type { QuickAddKey } from "@/components/dialogs/quickAdd";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRightIcon, ChevronRightIcon, PlusIcon } from "lucide-react";

import { NAV_CATEGORY_LIMIT } from "./navConfig";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

/**
 * One collapsible category in the sidebar. Lazily fetches its list the first
 * time it is expanded (so app load doesn't fire every category's query at
 * once), then shows the top items plus a "See All" link to the list page.
 */
export function NavCategory({
  category,
  onQuickAdd,
}: {
  category: NavCategoryConfig;
  onQuickAdd: (key: QuickAddKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const Icon = category.icon;

  const {
    data, isPending, isError,
  } = useQuery({
    queryKey: category.queryKey,
    queryFn: category.load,
    enabled: open,
  });

  const items = data?.slice(0, NAV_CATEGORY_LIMIT) ?? [];

  return (
    <Collapsible
      asChild
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={category.label}>
            <Icon />
            <span>{category.label}</span>
            <ChevronRightIcon
              className={`
                ml-auto transition-transform duration-200
                group-data-[state=open]/collapsible:rotate-90
              `}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {open && isPending && (
              <>
                <SidebarMenuSkeleton />
                <SidebarMenuSkeleton />
                <SidebarMenuSkeleton />
              </>
            )}
            {isError && (
              <SidebarMenuSubItem>
                <span className="px-2 text-xs text-muted-foreground">
                  Failed to load
                </span>
              </SidebarMenuSubItem>
            )}
            {!isPending && !isError && items.length === 0 && (
              <SidebarMenuSubItem>
                <span className="px-2 text-xs text-muted-foreground">
                  No items
                </span>
              </SidebarMenuSubItem>
            )}
            {items.map(item => (
              <SidebarMenuSubItem key={item.id}>
                <SidebarMenuSubButton asChild>
                  <Link
                    {...category.getDetailLink(item.id)}
                    className="[&.active]:font-medium"
                  >
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
            <SidebarMenuSubItem>
              <SidebarMenuSubButton
                asChild
                className="text-sidebar-foreground/70"
              >
                <Link
                  to={category.listTo}
                  className="[&.active]:font-medium"
                >
                  <ArrowRightIcon className="size-4" />
                  See All
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => onQuickAdd(category.quickAddKey)}
              >
                <PlusIcon className="size-4" />
                New
                {" "}
                {category.label}
              </Button>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
