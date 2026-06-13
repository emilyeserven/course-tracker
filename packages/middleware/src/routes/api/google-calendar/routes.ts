import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import callback from "./callback";
import connect from "./connect";
import disconnect from "./disconnect";
import root from "./root";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(root);
  fastify.register(connect);
  fastify.register(callback);
  fastify.register(disconnect);
}
