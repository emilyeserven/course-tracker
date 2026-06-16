import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import tasksRoot from "./root";
import getTask from "./getTask";
import createTask from "./createTask";
import upsertTask from "./upsertTask";
import deleteTask from "./deleteTask";
import tasksDailies from "./tasksDailies";
import updateTodoStatus from "./updateTodoStatus";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(tasksRoot);
  fastify.register(tasksDailies);
  fastify.register(getTask);
  fastify.register(createTask);
  fastify.register(upsertTask);
  fastify.register(updateTodoStatus);
  fastify.register(deleteTask);
}
