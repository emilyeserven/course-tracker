import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import root from "./root";
import getDailyCriteriaTemplate from "./getDailyCriteriaTemplate";
import upsertDailyCriteriaTemplate from "./upsertDailyCriteriaTemplate";
import deleteDailyCriteriaTemplate from "./deleteDailyCriteriaTemplate";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(root);
  fastify.register(getDailyCriteriaTemplate);
  fastify.register(upsertDailyCriteriaTemplate);
  fastify.register(deleteDailyCriteriaTemplate);
}
