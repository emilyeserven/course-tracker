import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import courseRoot from "./root";
import getCourse from "./getCourse";
import createCourse from "./createCourse";
import deleteCourse from "./deleteCourse";
import upsertCourse from "./upsertCourse";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(courseRoot);
  fastify.register(getCourse);
  fastify.register(createCourse);
  fastify.register(deleteCourse);
  fastify.register(upsertCourse);
}
