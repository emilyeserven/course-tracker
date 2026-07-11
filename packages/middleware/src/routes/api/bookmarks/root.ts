import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import {
  BookmarksError,
  createBookmark,
  resolveBookmarkByUrl,
  searchBookmarks,
} from "@/services/bookmarks";
import { sendBadRequest } from "@/utils/errors";

// Proxy endpoints backed by src/services/bookmarks.ts. They front the companion
// Simple Bookmarks API so the browser stays same-origin, the bookmarks base URL
// stays server-side, and BookmarksError statuses map to friendly replies.
export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  const searchSchema = {
    schema: {
      description: "Search Simple Bookmarks by title/URL substring",
      querystring: {
        type: "object",
        properties: {
          q: {
            type: "string",
          },
        },
      },
    },
  } as const;

  fastify.get("/search", searchSchema, async (request, reply) => {
    const {
      q,
    } = request.query;
    try {
      return await searchBookmarks(q ?? "");
    }
    catch (err) {
      if (err instanceof BookmarksError) {
        return reply.code(err.statusCode).send({
          message: err.message,
        });
      }
      return sendBadRequest(reply, "Failed to search Simple Bookmarks.");
    }
  });

  const resolveSchema = {
    schema: {
      description: "Resolve a URL to an existing Simple Bookmarks bookmark",
      querystring: {
        type: "object",
        required: ["url"],
        properties: {
          url: {
            type: "string",
            minLength: 1,
          },
        },
      },
    },
  } as const;

  fastify.get("/resolve", resolveSchema, async (request, reply) => {
    const {
      url,
    } = request.query;
    try {
      // 200 with null when there's no match — the client treats that as
      // "not bookmarked yet" and offers to create it.
      return {
        bookmark: await resolveBookmarkByUrl(url),
      };
    }
    catch (err) {
      if (err instanceof BookmarksError) {
        return reply.code(err.statusCode).send({
          message: err.message,
        });
      }
      return sendBadRequest(reply, "Failed to resolve URL in Simple Bookmarks.");
    }
  });

  const createSchema = {
    schema: {
      description: "Create a bookmark in Simple Bookmarks from a URL",
      body: {
        type: "object",
        required: ["url"],
        additionalProperties: false,
        properties: {
          url: {
            type: "string",
            minLength: 1,
          },
          title: {
            type: "string",
          },
        },
      },
    },
  } as const;

  fastify.post("/", createSchema, async (request, reply) => {
    const {
      url, title,
    } = request.body;
    try {
      return await createBookmark(url, title);
    }
    catch (err) {
      if (err instanceof BookmarksError) {
        return reply.code(err.statusCode).send({
          message: err.message,
        });
      }
      return sendBadRequest(reply, "Failed to create the bookmark in Simple Bookmarks.");
    }
  });
}
