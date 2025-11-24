import React from "react";

import { createRootRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { EraserIcon, MoonIcon, SunIcon } from "lucide-react";

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

const RootComponent: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const {
    theme, setTheme,
  } = useTheme();

  function handleClearLocal() {
    navigate({
      to: "/onboard",
    });
    localStorage.clear();
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
