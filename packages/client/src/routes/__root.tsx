import type { QuickAddKey } from "@/components/dialogs/quickAdd";

import React, { useState } from "react";

import {
  createRootRoute,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { HomeIcon, MenuIcon } from "lucide-react";

import {
  QuickAddDialogs,
  QuickAddMenu,
  QUICK_ADD_OPTIONS,

} from "@/components/dialogs/quickAdd";
import { DropdownNavItem, NavDropdown } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/sonner";
import { useShowOnboard } from "@/hooks/useShowOnboard";

const RootComponent: React.FunctionComponent = () => {
  const [activeQuickAdd, setActiveQuickAdd] = useState<QuickAddKey | null>(null);

  const showOnboard = useShowOnboard();

  const navLinkClass = `
    underline-offset-2
    hover:underline
    [&.active]:font-bold
  `;

  return (
    <>
      <div className="container items-center justify-between gap-2 py-2">
        <div
          className={`
            hidden gap-4
            md:flex
          `}
        >
          <Link
            to="/dashboard"
            className={navLinkClass}
          >
            Dashboard
          </Link>

          {showOnboard && (
            <Link
              to="/onboard"
              className={navLinkClass}
            >
              Onboard
            </Link>
          )}

          <NavDropdown
            label="Records"
            to="/records"
          >
            <DropdownNavItem to="/providers">Providers</DropdownNavItem>
            <DropdownNavItem to="/resources">Resources</DropdownNavItem>
            <DropdownNavItem to="/topics">Topics</DropdownNavItem>
          </NavDropdown>

          <NavDropdown
            label="Plans"
            to="/plans"
          >
            <DropdownNavItem to="/domains">Domains</DropdownNavItem>
          </NavDropdown>

          <NavDropdown
            label="Actions"
            to="/actions"
          >
            <DropdownNavItem to="/routines">Routines</DropdownNavItem>
            <DropdownNavItem to="/tasks">Task Lists</DropdownNavItem>
          </NavDropdown>
        </div>
        <div
          className={`
            flex flex-row items-center gap-2
            md:hidden
          `}
        >
          <Link
            to="/dashboard"
            aria-label="Dashboard home"
            className="
              inline-flex size-9 items-center justify-center rounded-md border
              bg-background
              hover:bg-accent
              focus-visible:ring-2 focus-visible:ring-ring
              focus-visible:outline-none
            "
          >
            <HomeIcon className="size-4" />
          </Link>
        </div>
        <div
          className={`
            ml-auto flex flex-row gap-2
            md:hidden
          `}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild={true}>
              <Button
                variant="outline"
                size="icon"
                aria-label="Open navigation menu"
              >
                <MenuIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownNavItem to="/dashboard">Dashboard</DropdownNavItem>
                {showOnboard && (
                  <DropdownNavItem to="/onboard">Onboard</DropdownNavItem>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownNavItem
                  to="/records"
                  className="cursor-pointer font-semibold"
                >
                  Records
                </DropdownNavItem>
                <DropdownNavItem to="/providers">Providers</DropdownNavItem>
                <DropdownNavItem to="/resources">Resources</DropdownNavItem>
                <DropdownNavItem to="/topics">Topics</DropdownNavItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownNavItem
                  to="/plans"
                  className="cursor-pointer font-semibold"
                >
                  Plans
                </DropdownNavItem>
                <DropdownNavItem to="/domains">Domains</DropdownNavItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownNavItem
                  to="/actions"
                  className="cursor-pointer font-semibold"
                >
                  Actions
                </DropdownNavItem>
                <DropdownNavItem to="/routines">Routines</DropdownNavItem>
                <DropdownNavItem to="/tasks">Task Lists</DropdownNavItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Quick Add</DropdownMenuLabel>
                {QUICK_ADD_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <DropdownMenuItem
                      key={option.key}
                      className="cursor-pointer"
                      onSelect={() => setActiveQuickAdd(option.key)}
                    >
                      <Icon />
                      {option.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownNavItem to="/settings">Settings</DropdownNavItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div
          className={`
            hidden flex-row items-center gap-4
            md:flex
          `}
        >
          <QuickAddMenu onSelect={setActiveQuickAdd} />
          <Link
            to="/settings"
            className={navLinkClass}
          >
            Settings
          </Link>
        </div>
      </div>
      <hr />
      <div className="mb-8">
        <Outlet />
      </div>
      <QuickAddDialogs
        active={activeQuickAdd}
        onClose={() => setActiveQuickAdd(null)}
      />
      <Toaster />
    </>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
