import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import domainRoot from "./root";
import getDomain from "./getDomain";
import createDomain from "./createDomain";
import upsertDomain from "./upsertDomain";
import deleteDomain from "./deleteDomain";
import duplicateDomain from "./duplicateDomain";
import getRadar from "./getRadar";
import upsertRadarConfig from "./upsertRadarConfig";
import createBlip from "./createBlip";
import upsertBlip from "./upsertBlip";
import deleteBlip from "./deleteBlip";
import bulkCreateBlips from "./bulkCreateBlips";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(domainRoot);
  fastify.register(getDomain);
  fastify.register(createDomain);
  fastify.register(upsertDomain);
  fastify.register(deleteDomain);
  fastify.register(duplicateDomain);
  fastify.register(getRadar);
  fastify.register(upsertRadarConfig);
  fastify.register(createBlip);
  fastify.register(upsertBlip);
  fastify.register(deleteBlip);
  fastify.register(bulkCreateBlips);
}
