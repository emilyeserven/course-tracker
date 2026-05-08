import React from "react";

import { useQuery } from "@tanstack/react-query";
import {
  createRootRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { EraserIcon, MenuIcon, MoonIcon, SproutIcon, SunIcon } from "lucide-react";

import { NavDropdown } from "@/components/layout/NavDropdown";
import { Toaster } from "@/components/sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemInteractive,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme.ts";
import {
  fetchClear,
  fetchCourses,
  fetchDomains,
  fetchProviders,
  fetchSeed,
  fetchTopics,
} from "@/utils";

const RootComponent: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const {
    theme, setTheme,
  } = useTheme();

  const {
    isFetching: isSeedFetching,
    error: seedError,
    refetch: seedRefetch,
  } = useQuery({
    enabled: false,
    queryKey: ["seed"],
    queryFn: () => fetchSeed(),
  });

  const {
    isFetching: isClearFetching,
    error: clearError,
    refetch: clearRefetch,
  } = useQuery({
    enabled: false,
    queryKey: ["clear"],
    queryFn: () => fetchClear(),
  });

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

  async function handleClearLocal() {
    const clearRefetchResult = await clearRefetch();

    if (clearRefetchResult.status === "success") {
      navigate({
        to: "/courses",
        reloadDocument: true,
      });
    }
  }

  async function handleClearSeedLocal() {
    const seedRefetchResult = await seedRefetch();
    if (seedRefetchResult.status === "success") {
      navigate({
        to: "/courses",
        reloadDocument: true,
      });
    }
  }

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
            label="Courses"
            to="/courses"
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
        <div className="md:hidden">
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
            <DropdownMenuContent align="start">
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
                  <Link to="/courses">Courses</Link>
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
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-row gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild={true}>
              <Button>Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Data Tools</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItemInteractive
                  onClick={() => handleClearLocal()}
                  isLoading={isClearFetching}
                  isError={clearError}
                >
                  <EraserIcon />
                  Clear Data
                </DropdownMenuItemInteractive>
                <DropdownMenuItemInteractive
                  onClick={() => handleClearSeedLocal()}
                  isLoading={isSeedFetching}
                  isError={seedError}
                >
                  <SproutIcon />
                  Clear & Seed Data
                </DropdownMenuItemInteractive>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuGroup>
                {theme === "dark"
                  ? (
                    <DropdownMenuItem
                      onClick={() => {
                        setTheme("light");
                      }}
                    >
                      <SunIcon />
                      Set to Light Mode
                    </DropdownMenuItem>
                  )
                  : (
                    <DropdownMenuItem
                      onClick={() => {
                        setTheme("dark");
                      }}
                    >
                      <MoonIcon />
                      Set to Dark Mode
                    </DropdownMenuItem>
                  )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
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
