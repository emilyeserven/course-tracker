import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import courseRoot from "./root";
import getProviders from "./getProviders";
import createProvider from "./createProvider";
import upsertProvider from "./upsertProvider";
import deleteProviders from "./deleteProviders";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(courseRoot);
  fastify.register(getProviders);
  fastify.register(createProvider);
  fastify.register(upsertProvider);
  fastify.register(deleteProviders);
}
