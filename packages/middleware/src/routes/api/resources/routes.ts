import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import courseRoot from "./root";
import getCourse from "./getResource";
import deleteCourse from "./deleteResource";
import upsertResource from "./upsertResource";
import duplicateResource from "./duplicateResource";
import incrementResourceProgress from "./incrementResourceProgress";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(courseRoot);
  fastify.register(getCourse);
  fastify.register(deleteCourse);
  fastify.register(upsertResource);
  fastify.register(duplicateResource);
  fastify.register(incrementResourceProgress);
}
