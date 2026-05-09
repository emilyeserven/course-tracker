import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import root from "./root";
import getTagGroup from "./getTagGroup";
import upsertTagGroup from "./upsertTagGroup";
import deleteTagGroup from "./deleteTagGroup";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(root);
  fastify.register(getTagGroup);
  fastify.register(upsertTagGroup);
  fastify.register(deleteTagGroup);
}
