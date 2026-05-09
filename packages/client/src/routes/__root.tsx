import React from "react";

import { useQuery } from "@tanstack/react-query";
import {
  createRootRoute,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { HomeIcon, MenuIcon } from "lucide-react";

import { NavDropdown } from "@/components/layout/NavDropdown";
import { Toaster } from "@/components/sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  fetchCourses,
  fetchDomains,
  fetchProviders,
  fetchTopics,
} from "@/utils";

const RootComponent: React.FunctionComponent = () => {
  const {
    data: coursesData,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchCourses(),
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
    = coursesData !== undefined
      && topicsData !== undefined
      && providersData !== undefined
      && domainsData !== undefined;
  const showOnboard
    = !allLoaded
      || (!coursesData?.length
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
            label="Resources"
            to="/resources"
          >
            <DropdownMenuItem
              asChild
              className="cursor-pointer"
            >
              <Link to="/providers">Providers</Link>
            </DropdownMenuItem>
          </NavDropdown>

          <NavDropdown
            label="Topics"
            to="/topics"
          >
            <DropdownMenuItem
              asChild
              className="cursor-pointer"
            >
              <Link to="/domains">Domains</Link>
            </DropdownMenuItem>
          </NavDropdown>

          <Link
            to="/dailies"
            className={navLinkClass}
          >
            Dailies
          </Link>

          <Link
            to="/tasks"
            className={navLinkClass}
          >
            Tasks
          </Link>
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
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer"
                >
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                {showOnboard && (
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer"
                  >
                    <Link to="/onboard">Onboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer"
                >
                  <Link to="/resources">Resources</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer"
                >
                  <Link to="/providers">Providers</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer"
                >
                  <Link to="/topics">Topics</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer"
                >
                  <Link to="/domains">Domains</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer"
                >
                  <Link to="/dailies">Dailies</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer"
                >
                  <Link to="/tasks">Tasks</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer"
                >
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
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
