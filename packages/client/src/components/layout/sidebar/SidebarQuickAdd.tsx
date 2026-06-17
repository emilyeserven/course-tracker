import type { QuickAddKey, QuickAddOption } from "@/components/dialogs/quickAdd";

import { PlusIcon } from "lucide-react";

import { QUICK_ADD_OPTIONS } from "@/components/dialogs/quickAdd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface SidebarQuickAddProps {
  onSelect: (key: QuickAddKey) => void;
}

function QuickAddItems({
  options,
  onSelect,
}: {
  options: QuickAddOption[];
  onSelect: (key: QuickAddKey) => void;
}) {
  return options.map((option) => {
    const Icon = option.icon;
    return (
      <DropdownMenuItem
        key={option.key}
        className="cursor-pointer"
        onSelect={() => onSelect(option.key)}
      >
        <Icon />
        {option.label}
      </DropdownMenuItem>
    );
  });
}

/**
 * Footer Quick Add. Mirrors the old top-bar `QuickAddMenu` grouping but is
 * triggered from a sidebar button; selecting an item opens the matching modal
 * via `onSelect` (it never navigates).
 */
export function SidebarQuickAdd({
  onSelect,
}: SidebarQuickAddProps) {
  const {
    isMobile,
  } = useSidebar();

  const external = QUICK_ADD_OPTIONS.filter(o => o.group === "external");
  const tracker = QUICK_ADD_OPTIONS.filter(o => o.group === "tracker");

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton tooltip="Quick Add">
            <PlusIcon />
            <span>Quick Add</span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={isMobile ? "bottom" : "right"}
          align="end"
          className="min-w-48"
        >
          <DropdownMenuLabel>Send to</DropdownMenuLabel>
          <QuickAddItems
            options={external}
            onSelect={onSelect}
          />
          <DropdownMenuSeparator />
          <DropdownMenuLabel>New record</DropdownMenuLabel>
          <QuickAddItems
            options={tracker}
            onSelect={onSelect}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
