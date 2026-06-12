import React from "react";

import { useQuery } from "@tanstack/react-query";
import {
  createRootRoute,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { HomeIcon, MenuIcon } from "lucide-react";

import { DropdownNavItem } from "@/components/layout/DropdownNavItem";
import { NavDropdown } from "@/components/layout/NavDropdown";
import { Toaster } from "@/components/sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  fetchResources,
  fetchDomains,
  fetchProviders,
  fetchTopics,
} from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

const RootComponent: React.FunctionComponent = () => {
  const {
    data: resourcesData,
  } = useQuery({
    queryKey: queryKeys.resources.list(),
    queryFn: () => fetchResources(),
  });

  const {
    data: topicsData,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: () => fetchTopics(),
  });

  const {
    data: providersData,
  } = useQuery({
    queryKey: ["providers"],
    queryFn: () => fetchProviders(),
  });

  const {
    data: domainsData,
  } = useQuery({
    queryKey: ["domains"],
    queryFn: () => fetchDomains(),
  });

  const allLoaded
    = resourcesData !== undefined
      && topicsData !== undefined
      && providersData !== undefined
      && domainsData !== undefined;
  const showOnboard
    = !allLoaded
      || (!resourcesData?.length
        && !topicsData?.length
        && !providersData?.length
        && !domainsData?.length);

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
            <DropdownNavItem to="/tasks">Tasks</DropdownNavItem>
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
                <DropdownNavItem to="/tasks">Tasks</DropdownNavItem>
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
            hidden flex-row gap-2
            md:flex
          `}
        >
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
      <Toaster />
    </>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
