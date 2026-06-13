import { useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  disconnectGoogleCalendar,
  fetchGoogleCalendars,
  fetchSettings,
  GOOGLE_CALENDAR_CONNECT_URL,
  updateSettings,
} from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

export function GoogleCalendarSection() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: () => fetchSettings(),
  });

  const configured = settingsQuery.data?.googleCalendarConfigured ?? false;
  const email = settingsQuery.data?.googleAccountEmail ?? null;

  // Only fetch the calendar list once a connection exists.
  const calendarsQuery = useQuery({
    queryKey: queryKeys.googleCalendar.calendars(),
    queryFn: () => fetchGoogleCalendars(),
    enabled: configured,
  });

  // Local mirror of the saved selection so checkboxes feel instant; re-seeded
  // whenever the server value changes (e.g. after a disconnect).
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => {
    setSelected(settingsQuery.data?.googleSelectedCalendarIds ?? []);
  }, [settingsQuery.data?.googleSelectedCalendarIds]);

  const saveMutation = useMutation({
    mutationFn: (ids: string[]) =>
      updateSettings({
        googleSelectedCalendarIds: ids,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.detail(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.googleCalendar.events(),
      });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const disconnectMutation = useMutation({
    mutationFn: () => disconnectGoogleCalendar(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.detail(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.googleCalendar.events(),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.googleCalendar.calendars(),
      });
      toast.success("Google Calendar disconnected");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function toggleCalendar(id: string) {
    const next = selected.includes(id)
      ? selected.filter(x => x !== id)
      : [...selected, id];
    setSelected(next);
    saveMutation.mutate(next);
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">Google Calendar</h2>
      <p className="text-sm text-muted-foreground">
        Connect Google Calendar to show your upcoming events on the dashboard.
        Events from every calendar you tick below are merged into one agenda.
      </p>

      {!configured
        ? (
          <div>
            <Button
              onClick={() => {
                window.location.href = GOOGLE_CALENDAR_CONNECT_URL;
              }}
            >
              Connect Google Calendar
            </Button>
          </div>
        )
        : (
          <>
            <p className="text-sm text-muted-foreground">
              Connected
              {email ? ` as ${email}` : ""}
              .
            </p>

            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Calendars to show</h3>
              {calendarsQuery.isPending && (
                <p className="text-sm text-muted-foreground">
                  Loading calendars…
                </p>
              )}
              {calendarsQuery.error && (
                <p className="text-sm text-destructive">
                  Failed to load calendars.
                </p>
              )}
              {calendarsQuery.data?.map(cal => (
                <label
                  key={cal.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(cal.id)}
                    onChange={() => toggleCalendar(cal.id)}
                  />
                  {cal.backgroundColor && (
                    <span
                      aria-hidden
                      className="size-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor: cal.backgroundColor,
                      }}
                    />
                  )}
                  <span>{cal.summary}</span>
                  {cal.primary && (
                    <span className="text-xs text-muted-foreground">
                      (primary)
                    </span>
                  )}
                </label>
              ))}
            </div>

            <div>
              <Button
                variant="outline"
                onClick={() => disconnectMutation.mutate()}
                disabled={disconnectMutation.isPending}
              >
                Disconnect
              </Button>
            </div>
          </>
        )}
    </section>
  );
}
