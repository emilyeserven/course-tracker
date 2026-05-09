import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import apiSeed from "./seed";
import apiClear from "./clearData";
import apiFormSubmit from "./submitOnboardData";
import courses from "./courses/routes";
import topics from "./topics/routes";
import providers from "./providers/routes";
import domains from "./domains/routes";
import dailies from "./dailies/routes";
import tasks from "./tasks/routes";
import taskTypes from "./task-types/routes";
import tagGroups from "./tag-groups/routes";
import tags from "./tags/routes";
import dailyCriteriaTemplates from "./daily-criteria-templates/routes";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(apiSeed);
  fastify.register(apiClear);
  fastify.register(apiFormSubmit);
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
  fastify.register(dailies, {
    prefix: "/dailies",
  });
  fastify.register(tasks, {
    prefix: "/tasks",
  });
  fastify.register(taskTypes, {
    prefix: "/task-types",
  });
  fastify.register(tagGroups, {
    prefix: "/tag-groups",
  });
  fastify.register(tags, {
    prefix: "/tags",
  });
  fastify.register(dailyCriteriaTemplates, {
    prefix: "/daily-criteria-templates",
  });
}
