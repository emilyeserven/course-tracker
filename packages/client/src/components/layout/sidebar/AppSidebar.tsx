import type { QuickAddKey } from "@/components/dialogs/quickAdd";

import { Link } from "@tanstack/react-router";
import { GraduationCapIcon, SettingsIcon } from "lucide-react";

import { NavMain } from "./NavMain";
import { SidebarQuickAdd } from "./SidebarQuickAdd";
import { SidebarThemeToggle } from "./SidebarThemeToggle";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  /** Opens the Quick Add modal for the chosen entity (never navigates). */
  onQuickAdd: (key: QuickAddKey) => void;
}

/** The app's left-hand collapsible navigation sidebar. */
export function AppSidebar({
  onQuickAdd,
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              tooltip="Course Tracker"
            >
              <Link to="/dashboard">
                <div
                  className={`
                    flex aspect-square size-8 items-center justify-center
                    rounded-lg bg-sidebar-primary
                    text-sidebar-primary-foreground
                  `}
                >
                  <GraduationCapIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm/tight">
                  <span className="truncate font-semibold">Course Tracker</span>
                  <span className="truncate text-xs">emstack</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain onQuickAdd={onQuickAdd} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarQuickAdd onSelect={onQuickAdd} />
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Settings"
            >
              <Link
                to="/settings"
                className="[&.active]:font-medium"
              >
                <SettingsIcon />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarThemeToggle />
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
