import type { AppSettingsUpdate, BookmarkClickTarget } from "@emstack/types";

import { useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fetchSettings, updateSettings } from "@/utils/api/settings";
import { queryKeys } from "@/utils/queryKeys";

const CLICK_TARGET_OPTIONS: { value: BookmarkClickTarget;
  label: string; }[] = [
  {
    value: "page",
    label: "Open the page itself (the article/book/video)",
  },
  {
    value: "bookmark",
    label: "Open the bookmark's page in Simple Bookmarks",
  },
];

export function BookmarksSection() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: fetchSettings,
  });
  const data = settingsQuery.data;

  // Seed the endpoint input from the stored override once, then let the user
  // edit freely (blank = fall back to the env/default endpoint).
  const [endpoint, setEndpoint] = useState("");
  const [seeded, setSeeded] = useState(false);
  useEffect(() => {
    if (data && !seeded) {
      setEndpoint(data.bookmarkApiUrl ?? "");
      setSeeded(true);
    }
  }, [data, seeded]);

  const saveMutation = useMutation({
    mutationFn: (update: AppSettingsUpdate) => updateSettings(update),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.detail(),
      });
      toast.success("Bookmark settings saved");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // No server-side cache exists — refreshing just drops the browser's cached
  // bookmark data and the routine/daily projections that carry reading progress,
  // so both refetch from Simple Bookmarks.
  function refreshBookmarkData() {
    queryClient.invalidateQueries({
      queryKey: ["bookmarks"],
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.dailies.list(),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.routines.list(),
    });
    toast.success("Refreshing bookmark data…");
  }

  const clickTarget = data?.bookmarkClickTarget ?? "page";
  const resolved = data?.bookmarkApiUrlResolved ?? "";
  const trimmed = endpoint.trim();
  const storedOverride = data?.bookmarkApiUrl ?? "";
  const endpointDirty = trimmed !== storedOverride;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">Bookmarks</h2>
      <p className="text-sm text-muted-foreground">
        Course Tracker links to bookmarks in the companion
        {" "}
        <span className="font-medium">Simple Bookmarks</span>
        {" "}
        app. Point it at
        your instance, choose what clicking a bookmark opens, and refresh the
        cached bookmark data on demand.
      </p>

      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium"
          htmlFor="bookmark-endpoint"
        >
          Endpoint URL
        </label>
        <Input
          id="bookmark-endpoint"
          type="url"
          autoComplete="off"
          value={endpoint}
          onChange={e => setEndpoint(e.target.value)}
          placeholder={resolved || "http://eserve-raspi:3000"}
          className="sm:max-w-md"
        />
        <p className="text-xs text-muted-foreground">
          Leave blank to use the server default
          {resolved ? ` (${resolved})` : ""}.
        </p>
        <div className="flex gap-2">
          <Button
            onClick={() =>
              saveMutation.mutate({
                bookmarkApiUrl: trimmed || null,
              })}
            disabled={!endpointDirty || saveMutation.isPending}
          >
            Save endpoint
          </Button>
          {storedOverride && (
            <Button
              variant="outline"
              onClick={() => {
                setEndpoint("");
                saveMutation.mutate({
                  bookmarkApiUrl: null,
                });
              }}
              disabled={saveMutation.isPending}
            >
              Reset to default
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Clicking a bookmark</span>
        <RadioGroup
          value={clickTarget}
          onValueChange={value =>
            saveMutation.mutate({
              bookmarkClickTarget: value as BookmarkClickTarget,
            })}
          disabled={saveMutation.isPending}
        >
          {CLICK_TARGET_OPTIONS.map(option => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm"
            >
              <RadioGroupItem value={option.value} />
              {option.label}
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Cached bookmark data</span>
        <div>
          <Button
            variant="outline"
            onClick={refreshBookmarkData}
          >
            Clear &amp; refresh
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Refetches bookmark titles, sections, and reading progress from Simple
          Bookmarks.
        </p>
      </div>
    </section>
  );
}
