import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { EraserIcon, SproutIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fetchClear, fetchSeed } from "@/utils";

export function DataToolsSection() {
  const navigate = useNavigate();

  const {
    isFetching: isSeedFetching, refetch: seedRefetch,
  } = useQuery({
    enabled: false,
    queryKey: ["seed"],
    queryFn: () => fetchSeed(),
  });

  const {
    isFetching: isClearFetching, refetch: clearRefetch,
  } = useQuery({
    enabled: false,
    queryKey: ["clear"],
    queryFn: () => fetchClear(),
  });

  async function handleClearLocal() {
    const clearRefetchResult = await clearRefetch();

    if (clearRefetchResult.status === "success") {
      navigate({
        to: "/dashboard",
        reloadDocument: true,
      });
    }
  }

  async function handleClearSeedLocal() {
    const seedRefetchResult = await seedRefetch();
    if (seedRefetchResult.status === "success") {
      navigate({
        to: "/dashboard",
        reloadDocument: true,
      });
    }
  }

  return (
    <section className="flex flex-col gap-3">
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
  );
}
