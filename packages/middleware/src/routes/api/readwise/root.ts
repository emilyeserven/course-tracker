import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import type { ReadwiseReadingList } from "@emstack/types";
import {
  fetchReadingList,
  getReadwiseToken,
  ReadwiseError,
} from "@/services/readwise";
import { sendBadRequest } from "@/utils/errors";

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
}
