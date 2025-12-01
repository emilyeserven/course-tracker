import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import apiRoot from "./root";
import apiTest from "./testRoute";
import dbTest from "./dbTest";
import courses from "./courses/routes";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(apiRoot);
  fastify.register(apiTest);
  fastify.register(dbTest);
  fastify.register(courses, {
    prefix: "/courses",
  });
}
