import type { DashboardTileProps } from "./-dashboardTileMeta";
import type { GoogleCalendarEvent } from "@emstack/types";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import {
  CardSettingsFlyout,
  DashboardCard,
  DashboardSectionStatus,
  isAutoHeight,
  queryKeys,
} from "./-cardKit";
import { formatEventTime, groupEventsByDay } from "./-googleCalendarAgenda";

import { fetchGoogleCalendarEvents } from "@/utils";

function EventRow({
  event,
}: { event: GoogleCalendarEvent }) {
  return (
    <li className="flex flex-row items-start gap-2 py-2">
      <span
        aria-hidden
        className="mt-1.5 size-2 shrink-0 rounded-full bg-muted-foreground/40"
        style={event.calendarColor
          ? {
            backgroundColor: event.calendarColor,
          }
          : undefined}
      />
      <div className="flex min-w-0 flex-col gap-0.5">
        <a
          href={event.htmlLink || undefined}
          target="_blank"
          rel="noreferrer"
          className="
            truncate font-medium
            hover:text-blue-600
          "
        >
          {event.summary}
        </a>
        <span
          className="
            flex flex-wrap items-center gap-1 text-xs text-muted-foreground
          "
        >
          <span>{formatEventTime(event)}</span>
          <span aria-hidden>·</span>
          <span className="truncate">{event.calendarName}</span>
          {event.location && (
            <>
              <span aria-hidden>·</span>
              <span className="truncate">{event.location}</span>
            </>
          )}
        </span>
      </div>
    </li>
  );
}

export function DashboardGoogleCalendar({
  tile,
  onUpdateTile,
}: DashboardTileProps) {
  const {
    data, isPending, error,
  } = useQuery({
    queryKey: queryKeys.googleCalendar.events(),
    queryFn: () => fetchGoogleCalendarEvents(),
    staleTime: 5 * 60 * 1000,
  });

  const configured = data?.configured ?? false;
  const events = data?.events ?? [];
  const groups = groupEventsByDay(events, new Date());

  return (
    <DashboardCard
      autoHeight={isAutoHeight(tile)}
      title="Calendar"
      settings={(
        <CardSettingsFlyout
          tile={tile}
          onUpdateTile={onUpdateTile}
        >
          <Link
            to="/settings"
            search={{
              tab: "connections",
            }}
            className="
              text-sm text-primary underline-offset-2
              hover:underline
            "
          >
            Manage calendars
          </Link>
        </CardSettingsFlyout>
      )}
    >
      {!isPending && !error && !configured
        ? (
          <p className="text-sm text-muted-foreground">
            Add a calendar feed in
            {" "}
            <Link
              to="/settings"
              search={{
                tab: "connections",
              }}
              className="
                text-primary underline-offset-2
                hover:underline
              "
            >
              Settings
            </Link>
            {" "}
            to see your upcoming events.
          </p>
        )
        : (
          <>
            <DashboardSectionStatus
              isPending={isPending}
              error={error}
              isEmpty={configured && events.length === 0}
              entity="events"
              emptyMessage="No upcoming events."
            />
            {groups.map(group => (
              <div
                key={group.dateKey}
                className="flex flex-col gap-1"
              >
                <h3
                  className="
                    text-xs font-semibold tracking-wide text-muted-foreground
                    uppercase
                  "
                >
                  {group.label}
                </h3>
                <ul className="flex flex-col divide-y">
                  {group.events.map(event => (
                    <EventRow
                      key={`${event.calendarId}:${event.id}`}
                      event={event}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}
    </DashboardCard>
  );
}
