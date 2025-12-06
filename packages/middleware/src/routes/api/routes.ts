import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import apiRoot from "./root";
import apiTest from "./testRoute";
import apiSeed from "./seed";
import apiClear from "./clearData";
import dbTest from "./dbTest";
import apiFormSubmit from "./submitOnboardData";
import courses from "./courses/routes";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(apiRoot);
  fastify.register(apiTest);
  fastify.register(apiSeed);
  fastify.register(apiClear);
  fastify.register(apiFormSubmit);
  fastify.register(dbTest);
  fastify.register(courses, {
    prefix: "/courses",
  });
}
