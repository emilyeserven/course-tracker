import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import root from "./root";
import getRoutineTemplate from "./getRoutineTemplate";
import upsertRoutineTemplate from "./upsertRoutineTemplate";
import deleteRoutineTemplate from "./deleteRoutineTemplate";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(root);
  fastify.register(getRoutineTemplate);
  fastify.register(upsertRoutineTemplate);
  fastify.register(deleteRoutineTemplate);
}
