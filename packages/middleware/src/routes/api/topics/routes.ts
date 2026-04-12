import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import courseRoot from "./root";
import getTopic from "./getTopic";
import createTopic from "./createTopic";
import deleteTopic from "./deleteTopic";
import upsertTopic from "./upsertTopic";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(courseRoot);
  fastify.register(getTopic);
  fastify.register(createTopic);
  fastify.register(deleteTopic);
  fastify.register(upsertTopic);
}
