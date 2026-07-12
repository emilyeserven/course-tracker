import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import apiSeed from "./seed";
import apiClear from "./clearData";
import routines from "./routines/routes";
import tasks from "./tasks/routes";
import taskTypes from "./task-types/routes";
import tagGroups from "./tag-groups/routes";
import tags from "./tags/routes";
import dailyCriteriaTemplates from "./daily-criteria-templates/routes";
import routineTemplates from "./routine-templates/routes";
import dashboardLayouts from "./dashboard-layouts/routes";
import settings from "./settings/routes";
import readwise from "./readwise/routes";
import todoist from "./todoist/routes";
import googleCalendar from "./google-calendar/routes";
import bookmarks from "./bookmarks/routes";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  // Destructive dev-only helpers (GET /seed, GET /clearData) — never expose
  // them in production, where a single request could wipe the database.
  if (process.env.NODE_ENV !== "production") {
    fastify.register(apiSeed);
    fastify.register(apiClear);
  }
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
  fastify.register(googleCalendar, {
    prefix: "/google-calendar",
  });
  fastify.register(bookmarks, {
    prefix: "/bookmarks",
  });
}
