import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import domainRoot from "./root";
import getDomain from "./getDomain";
import createDomain from "./createDomain";
import upsertDomain from "./upsertDomain";
import deleteDomain from "./deleteDomain";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(domainRoot);
  fastify.register(getDomain);
  fastify.register(createDomain);
  fastify.register(upsertDomain);
  fastify.register(deleteDomain);
}
