import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import root from "./root";
import getModule from "./getModule";
import upsertModule from "./upsertModule";
import deleteModule from "./deleteModule";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(root);
  fastify.register(getModule);
  fastify.register(upsertModule);
  fastify.register(deleteModule);
}
