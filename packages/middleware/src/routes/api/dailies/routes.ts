import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import dailyRoot from "./root";
import getDaily from "./getDaily";
import createDaily from "./createDaily";
import upsertDaily from "./upsertDaily";
import deleteDaily from "./deleteDaily";
import duplicateDaily from "./duplicateDaily";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(dailyRoot);
  fastify.register(getDaily);
  fastify.register(createDaily);
  fastify.register(upsertDaily);
  fastify.register(deleteDaily);
  fastify.register(duplicateDaily);
}
