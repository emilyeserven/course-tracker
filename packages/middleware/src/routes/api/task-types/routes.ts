import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import root from "./root";
import getTaskType from "./getTaskType";
import upsertTaskType from "./upsertTaskType";
import deleteTaskType from "./deleteTaskType";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(root);
  fastify.register(getTaskType);
  fastify.register(upsertTaskType);
  fastify.register(deleteTaskType);
}
