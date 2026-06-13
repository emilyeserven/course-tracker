import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import type {
  GoogleCalendarEvents,
  GoogleCalendarListEntry,
} from "@emstack/types";
import {
  fetchCalendarList,
  fetchUpcomingEvents,
  getConnection,
  GoogleCalendarError,
} from "@/services/googleCalendar";
import { sendBadRequest } from "@/utils/errors";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  // Upcoming events across the user's selected calendars, for the dashboard
  // card. Mirrors the Todoist card: a 200 with configured:false when not
  // connected so the card can prompt rather than render an error.
  fastify.get("/events", async (request, reply) => {
    const conn = await getConnection();
    if (!conn) {
      const empty: GoogleCalendarEvents = {
        configured: false,
        events: [],
      };
      return empty;
    }

    try {
      const events = await fetchUpcomingEvents(conn, conn.selectedCalendarIds);
      const result: GoogleCalendarEvents = {
        configured: true,
        events,
      };
      return result;
    }
    catch (err) {
      if (err instanceof GoogleCalendarError) {
        return reply.code(err.statusCode).send({
          message: err.message,
        });
      }
      return sendBadRequest(reply, "Failed to load Google Calendar events.");
    }
  });

  // The user's calendars, for the Settings checkbox list. 409 when not
  // connected so the UI knows to show the connect button instead.
  fastify.get("/calendars", async (request, reply) => {
    const conn = await getConnection();
    if (!conn) {
      return reply.code(409).send({
        message: "Google Calendar is not connected.",
      });
    }

    try {
      const calendars: GoogleCalendarListEntry[] = await fetchCalendarList(conn);
      return calendars;
    }
    catch (err) {
      if (err instanceof GoogleCalendarError) {
        return reply.code(err.statusCode).send({
          message: err.message,
        });
      }
      return sendBadRequest(reply, "Failed to load Google calendars.");
    }
  });
}
