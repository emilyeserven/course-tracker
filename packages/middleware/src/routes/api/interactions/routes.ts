import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import root from "./root";
import getInteraction from "./getInteraction";
import upsertInteraction from "./upsertInteraction";
import deleteInteraction from "./deleteInteraction";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(root);
  fastify.register(getInteraction);
  fastify.register(upsertInteraction);
  fastify.register(deleteInteraction);
}
