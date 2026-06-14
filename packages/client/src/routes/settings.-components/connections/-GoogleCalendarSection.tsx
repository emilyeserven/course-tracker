import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { FEED_COLORS, FeedColorPicker } from "./-FeedColorPicker";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addCalendarFeed,
  fetchCalendarFeeds,
  removeCalendarFeed,
} from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

export function GoogleCalendarSection() {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(FEED_COLORS[0]);

  const feedsQuery = useQuery({
    queryKey: queryKeys.googleCalendar.feeds(),
    queryFn: () => fetchCalendarFeeds(),
  });

  function invalidate() {
    queryClient.invalidateQueries({
      queryKey: queryKeys.googleCalendar.feeds(),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.googleCalendar.events(),
    });
  }

  const addMutation = useMutation({
    mutationFn: () =>
      addCalendarFeed({
        url: url.trim(),
        name: name.trim(),
        color,
      }),
    onSuccess: () => {
      invalidate();
      setUrl("");
      setName("");
      toast.success("Calendar added");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeCalendarFeed(id),
    onSuccess: () => {
      invalidate();
      toast.success("Calendar removed");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const feeds = feedsQuery.data ?? [];
  const canAdd = url.trim().length > 0 && name.trim().length > 0;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">Calendar</h2>
      <p className="text-sm text-muted-foreground">
        Show upcoming events on the dashboard by subscribing to iCal feed URLs —
        no account login needed. In Google Calendar, open a calendar&apos;s
        {" "}
        <span className="font-medium">Settings → Integrate calendar</span>
        {" "}
        and
        copy its
        {" "}
        <span className="font-medium">Secret address in iCal format</span>
        .
        Outlook and iCloud iCal links work too. Changes can take a few hours to
        appear (the feed is cached by the provider).
      </p>

      {feeds.length > 0 && (
        <ul className="flex flex-col divide-y rounded-md border">
          {feeds.map(feed => (
            <li
              key={feed.id}
              className="flex items-center gap-2 px-3 py-2"
            >
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full bg-muted-foreground/40"
                style={
                  feed.color
                    ? {
                      backgroundColor: feed.color,
                    }
                    : undefined
                }
              />
              <span className="min-w-0 flex-1">
                <span className="font-medium">{feed.name}</span>
                <span className="ml-2 truncate text-xs text-muted-foreground">
                  {feed.urlHint}
                </span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeMutation.mutate(feed.id)}
                disabled={removeMutation.isPending}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2">
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Calendar name (e.g. Personal)"
          className="sm:max-w-md"
        />
        <Input
          type="url"
          autoComplete="off"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Paste the secret iCal URL (…/basic.ics)"
          className="sm:max-w-md"
        />
        <FeedColorPicker
          value={color}
          onChange={setColor}
        />
        <div>
          <Button
            onClick={() => addMutation.mutate()}
            disabled={!canAdd || addMutation.isPending}
          >
            Add calendar
          </Button>
        </div>
      </div>
    </section>
  );
}
