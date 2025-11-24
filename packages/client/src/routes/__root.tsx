import React from "react";

import { createRootRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/button";
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
          {
            theme === "dark"
              ? (
                <Button
                  variant="outline"
                  onClick={() => { setTheme("light"); }}
                >Set to Light Mode
                </Button>
              )
              : (
                <Button
                  variant="outline"
                  onClick={() => { setTheme("dark"); }}
                >Set to Dark Mode
                </Button>
              )
          }
          <Button
            variant="outline"
            onClick={() => handleClearLocal()}
          >
            Clear Local
          </Button>
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
