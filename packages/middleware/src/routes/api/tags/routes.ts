import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import root from "./root";
import getTag from "./getTag";
import upsertTag from "./upsertTag";
import deleteTag from "./deleteTag";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(root);
  fastify.register(getTag);
  fastify.register(upsertTag);
  fastify.register(deleteTag);
}
