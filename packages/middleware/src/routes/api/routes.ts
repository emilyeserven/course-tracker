import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import apiRoot from "./root";
import apiTest from "./testRoute";
import apiSeed from "./seed";
import apiClear from "./clearData";
import dbTest from "./dbTest";
import apiFormSubmit from "./submitOnboardData";
import courses from "./courses/routes";
import topics from "./topics/routes";
import providers from "./providers/routes";
import domains from "./domains/routes";
import dailies from "./dailies/routes";
import radar from "./radar/routes";
import tasks from "./tasks/routes";
import taskTypes from "./task-types/routes";
import dailyCriteriaTemplates from "./daily-criteria-templates/routes";

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
  fastify.register(topics, {
    prefix: "/topics",
  });
  fastify.register(providers, {
    prefix: "/providers",
  });
  fastify.register(domains, {
    prefix: "/domains",
  });
  fastify.register(radar, {
    prefix: "/domains",
  });
  fastify.register(dailies, {
    prefix: "/dailies",
  });
  fastify.register(tasks, {
    prefix: "/tasks",
  });
  fastify.register(taskTypes, {
    prefix: "/task-types",
  });
  fastify.register(dailyCriteriaTemplates, {
    prefix: "/daily-criteria-templates",
  });
}
