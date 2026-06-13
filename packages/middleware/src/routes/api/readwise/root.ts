import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import type { ReadwiseReadingList } from "@emstack/types";
import {
  fetchReadingList,
  getReadwiseToken,
  ReadwiseError,
  saveReadwiseDocument,
} from "@/services/readwise";
import { sendBadRequest } from "@/utils/errors";
import { nullableString } from "@/utils/schemas";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/reading-list",
    async (request, reply) => {
      const token = await getReadwiseToken();

      // No key yet — respond 200 with configured:false so the dashboard card can
      // prompt the user to add one rather than rendering an error state.
      if (!token) {
        const empty: ReadwiseReadingList = {
          configured: false,
          started: [],
          unstarted: [],
        };
        return empty;
      }

      try {
        const {
          started, unstarted,
        } = await fetchReadingList(token);
        const result: ReadwiseReadingList = {
          configured: true,
          started,
          unstarted,
        };
        return result;
      }
      catch (err) {
        if (err instanceof ReadwiseError) {
          return reply.code(err.statusCode).send({
            message: err.message,
          });
        }
        return sendBadRequest(reply, "Failed to load Readwise reading list.");
      }
    },
  );

  fastify.post(
    "/save",
    {
      schema: {
        body: {
          type: "object",
          required: ["url"],
          additionalProperties: false,
          properties: {
            url: {
              type: "string",
              minLength: 1,
            },
            title: nullableString,
          },
        },
      },
    },
    async (request, reply) => {
      const token = await getReadwiseToken();
      if (!token) {
        return sendBadRequest(reply, "Readwise is not configured.");
      }

      const {
        url, title,
      } = request.body;
      try {
        const saved = await saveReadwiseDocument(token, url, title ?? undefined);
        return {
          status: "ok",
          id: saved.id,
        };
      }
      catch (err) {
        if (err instanceof ReadwiseError) {
          return reply.code(err.statusCode).send({
            message: err.message,
          });
        }
        return sendBadRequest(reply, "Failed to save to Readwise.");
      }
    },
  );
}
