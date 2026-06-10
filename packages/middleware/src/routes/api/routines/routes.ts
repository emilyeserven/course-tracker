import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import routineRoot from "./root";
import getRoutine from "./getRoutine";
import createRoutine from "./createRoutine";
import upsertRoutine from "./upsertRoutine";
import deleteRoutine from "./deleteRoutine";
import duplicateRoutine from "./duplicateRoutine";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(routineRoot);
  fastify.register(getRoutine);
  fastify.register(createRoutine);
  fastify.register(upsertRoutine);
  fastify.register(deleteRoutine);
  fastify.register(duplicateRoutine);
}
