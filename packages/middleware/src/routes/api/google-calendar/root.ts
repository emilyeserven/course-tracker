import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import type {
  CalendarFeedSummary,
  GoogleCalendarEvents,
} from "@emstack/types";
import {
  addCalendarFeed,
  fetchUpcomingEvents,
  getCalendarFeeds,
  getCalendarFeedSummaries,
  GoogleCalendarError,
  removeCalendarFeed,
} from "@/services/googleCalendar";
import { sendBadRequest } from "@/utils/errors";
import { idParamSchema } from "@/utils/schemas";

const addFeedSchema = {
  schema: {
    body: {
      type: "object",
      required: ["url", "name"],
      additionalProperties: false,
      properties: {
        url: {
          type: "string",
          minLength: 1,
        },
        name: {
          type: "string",
          minLength: 1,
        },
        color: {
          type: "string",
        },
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  // Upcoming events across all subscribed feeds, for the dashboard card.
  // Mirrors the Todoist card: configured:false when nothing is subscribed yet so
  // the card can prompt rather than render an error.
  fastify.get("/events", async (request, reply) => {
    const feeds = await getCalendarFeeds();
    if (feeds.length === 0) {
      const empty: GoogleCalendarEvents = {
        configured: false,
        events: [],
      };
      return empty;
    }

    try {
      const events = await fetchUpcomingEvents(feeds);
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
      return sendBadRequest(reply, "Failed to load calendar events.");
    }
  });

  // Subscribed feeds, for the Settings list (secret URLs masked).
  fastify.get("/feeds", async (): Promise<CalendarFeedSummary[]> => {
    return getCalendarFeedSummaries();
  });

  // Subscribe to a feed. Validates the URL serves iCal before saving.
  fastify.post("/feeds", addFeedSchema, async (request, reply) => {
    try {
      const id = await addCalendarFeed(request.body);
      return {
        status: "ok",
        id,
      };
    }
    catch (err) {
      if (err instanceof GoogleCalendarError) {
        return reply.code(err.statusCode).send({
          message: err.message,
        });
      }
      return sendBadRequest(reply, "Failed to add calendar feed.");
    }
  });

  // Unsubscribe from a feed.
  fastify.delete(
    "/feeds/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async (request) => {
      await removeCalendarFeed(request.params.id);
      return {
        status: "ok",
      };
    },
  );
}
