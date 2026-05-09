import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import root from "./root";
import getModuleGroup from "./getModuleGroup";
import upsertModuleGroup from "./upsertModuleGroup";
import deleteModuleGroup from "./deleteModuleGroup";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(root);
  fastify.register(getModuleGroup);
  fastify.register(upsertModuleGroup);
  fastify.register(deleteModuleGroup);
}
