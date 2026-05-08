import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import getRadar from "./getRadar";
import upsertRadarConfig from "./upsertRadarConfig";
import createBlip from "./createBlip";
import bulkCreateBlips from "./bulkCreateBlips";
import upsertBlip from "./upsertBlip";
import deleteBlip from "./deleteBlip";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(getRadar);
  fastify.register(upsertRadarConfig);
  fastify.register(createBlip);
  fastify.register(bulkCreateBlips);
  fastify.register(upsertBlip);
  fastify.register(deleteBlip);
}
