import type { QuickAddKey } from "@/components/dialogs/quickAdd";

import { Link } from "@tanstack/react-router";

import { NavCategory } from "./NavCategory";
import { NAV_SECTIONS, STANDALONE_LINKS } from "./navConfig";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

/** The sidebar body: standalone links plus the collapsible record sections. */
export function NavMain({
  onQuickAdd,
}: {
  onQuickAdd: (key: QuickAddKey) => void;
}) {
  const standaloneLinks = STANDALONE_LINKS;

  return (
    <>
      <SidebarGroup>
        <SidebarMenu>
          {standaloneLinks.map((link) => {
            const Icon = link.icon;
            return (
              <SidebarMenuItem key={link.label}>
                <SidebarMenuButton
                  asChild
                  tooltip={link.label}
                >
                  <Link
                    to={link.to}
                    className="[&.active]:font-medium"
                  >
                    <Icon />
                    <span>{link.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
      {NAV_SECTIONS.map(section => (
        <SidebarGroup key={section.label}>
          <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
          <SidebarMenu>
            {section.categories.map(category => (
              <NavCategory
                key={category.label}
                category={category}
                onQuickAdd={onQuickAdd}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
