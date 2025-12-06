import React from "react";

import { useQuery } from "@tanstack/react-query";
import { createRootRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { EraserIcon, LoaderIcon, MoonIcon, SproutIcon, SunIcon, TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";
import { LoadDialog } from "@/components/LoadDialog";
import { SaveDialog } from "@/components/SaveDialog";
import { useTheme } from "@/hooks/useTheme.ts";
import { fetchClear, fetchSeed } from "@/utils/fetchFunctions";

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
    console.log("clear seed clicked");
    const seedRefetchResult = await seedRefetch();
    if (seedRefetchResult.status === "success") {
      navigate({
        to: "/courses",
        reloadDocument: true,
      });
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 p-2">
        <div className="flex gap-2">
          <Link
            to="/"
            className="[&.active]:font-bold"
          >
            Home
          </Link>

          <Link
            to="/onboard"
            className="[&.active]:font-bold"
          >
            Onboard
          </Link>

          <Link
            to="/courses"
            className="[&.active]:font-bold"
          >
            Courses
          </Link>
        </div>
        <div className="flex flex-row gap-2">
          <SaveDialog />
          <LoadDialog />
          <DropdownMenu>
            <DropdownMenuTrigger asChild={true}>
              <Button>Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Data Tools</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => handleClearLocal()}
                >
                  <EraserIcon />
                  Clear Data
                  {isClearFetching && (
                    <LoaderIcon
                      className="animate-spin"
                    />
                  )}
                  {clearError && (
                    <TriangleAlertIcon />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleClearSeedLocal()}
                >
                  <SproutIcon />
                  Clear & Seed Data
                  {isSeedFetching && (
                    <LoaderIcon
                      className="animate-spin"
                    />
                  )}
                  {seedError && (
                    <TriangleAlertIcon />
                  )}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>
                Settings
              </DropdownMenuLabel>
              <DropdownMenuGroup>

                {
                  theme === "dark"
                    ? (
                      <DropdownMenuItem
                        onClick={() => { setTheme("light"); }}
                      >
                        <SunIcon />
                        Set to Light Mode
                      </DropdownMenuItem>
                    )
                    : (
                      <DropdownMenuItem
                        onClick={() => { setTheme("dark"); }}
                      >
                        <MoonIcon />
                        Set to Dark Mode
                      </DropdownMenuItem>
                    )
                }
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <hr />
      <div className="m-auto max-w-[1200px]">
        <Outlet />
      </div>
    </>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
