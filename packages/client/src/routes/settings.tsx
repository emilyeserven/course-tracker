import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EraserIcon, MoonIcon, SproutIcon, SunIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme.ts";
import { fetchClear, fetchSeed } from "@/utils";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  const navigate = useNavigate();
  const {
    theme, setTheme,
  } = useTheme();

  const {
    isFetching: isSeedFetching,
    refetch: seedRefetch,
  } = useQuery({
    enabled: false,
    queryKey: ["seed"],
    queryFn: () => fetchSeed(),
  });

  const {
    isFetching: isClearFetching,
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
    const seedRefetchResult = await seedRefetch();
    if (seedRefetchResult.status === "success") {
      navigate({
        to: "/courses",
        reloadDocument: true,
      });
    }
  }

  return (
    <div>
      <PageHeader pageTitle="Settings" />
      <div className="container flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Data Tools</h2>
          <div className="flex flex-col items-start gap-2">
            <Button
              variant="outline"
              onClick={() => handleClearLocal()}
              disabled={isClearFetching}
            >
              <EraserIcon />
              Clear Data
            </Button>
            <Button
              variant="outline"
              onClick={() => handleClearSeedLocal()}
              disabled={isSeedFetching}
            >
              <SproutIcon />
              Clear & Seed Data
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Appearance</h2>
          <div className="flex flex-col items-start gap-2">
            {theme === "dark"
              ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setTheme("light");
                  }}
                >
                  <SunIcon />
                  Set to Light Mode
                </Button>
              )
              : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setTheme("dark");
                  }}
                >
                  <MoonIcon />
                  Set to Dark Mode
                </Button>
              )}
          </div>
        </section>
      </div>
    </div>
  );
}
