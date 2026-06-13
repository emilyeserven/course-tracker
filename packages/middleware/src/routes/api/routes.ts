import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import apiSeed from "./seed";
import apiClear from "./clearData";
import apiFormSubmit from "./submitOnboardData";
import resources from "./resources/routes";
import topics from "./topics/routes";
import providers from "./providers/routes";
import domains from "./domains/routes";
import routines from "./routines/routes";
import tasks from "./tasks/routes";
import taskTypes from "./task-types/routes";
import tagGroups from "./tag-groups/routes";
import tags from "./tags/routes";
import moduleGroups from "./module-groups/routes";
import modules from "./modules/routes";
import interactions from "./interactions/routes";
import dailyCriteriaTemplates from "./daily-criteria-templates/routes";
import routineTemplates from "./routine-templates/routes";
import dashboardLayouts from "./dashboard-layouts/routes";
import settings from "./settings/routes";
import readwise from "./readwise/routes";
import todoist from "./todoist/routes";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  // Destructive dev-only helpers (GET /seed, GET /clearData) — never expose
  // them in production, where a single request could wipe the database.
  if (process.env.NODE_ENV !== "production") {
    fastify.register(apiSeed);
    fastify.register(apiClear);
  }
  fastify.register(apiFormSubmit);
  fastify.register(resources, {
    prefix: "/resources",
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
  fastify.register(routines, {
    prefix: "/routines",
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
  fastify.register(moduleGroups, {
    prefix: "/module-groups",
  });
  fastify.register(modules, {
    prefix: "/modules",
  });
  fastify.register(interactions, {
    prefix: "/interactions",
  });
  fastify.register(dailyCriteriaTemplates, {
    prefix: "/daily-criteria-templates",
  });
  fastify.register(routineTemplates, {
    prefix: "/routine-templates",
  });
  fastify.register(dashboardLayouts, {
    prefix: "/dashboard-layouts",
  });
  fastify.register(settings, {
    prefix: "/settings",
  });
  fastify.register(readwise, {
    prefix: "/readwise",
  });
  fastify.register(todoist, {
    prefix: "/todoist",
  });
}
