import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import type { TodoistTasks } from "@emstack/types";
import {
  closeTodoistTask,
  fetchTodayAndOverdue,
  getTodoistToken,
  TodoistError,
} from "@/services/todoist";
import { sendBadRequest } from "@/utils/errors";
import { idParamSchema } from "@/utils/schemas";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/tasks",
    async (request, reply) => {
      const token = await getTodoistToken();

      // No key yet — respond 200 with configured:false so the dashboard card can
      // prompt the user to add one rather than rendering an error state.
      if (!token) {
        const empty: TodoistTasks = {
          configured: false,
          overdue: [],
          today: [],
        };
        return empty;
      }

      try {
        const {
          overdue, today,
        } = await fetchTodayAndOverdue(token);
        const result: TodoistTasks = {
          configured: true,
          overdue,
          today,
        };
        return result;
      }
      catch (err) {
        if (err instanceof TodoistError) {
          return reply.code(err.statusCode).send({
            message: err.message,
          });
        }
        return sendBadRequest(reply, "Failed to load Todoist tasks.");
      }
    },
  );

  // Complete (close) a task. Used by the dashboard card's row checkbox.
  fastify.post(
    "/tasks/:id/close",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async (request, reply) => {
      const token = await getTodoistToken();
      if (!token) {
        return sendBadRequest(reply, "No Todoist API key configured.");
      }

      try {
        await closeTodoistTask(token, request.params.id);
        return {
          status: "ok",
        };
      }
      catch (err) {
        if (err instanceof TodoistError) {
          return reply.code(err.statusCode).send({
            message: err.message,
          });
        }
        return sendBadRequest(reply, "Failed to complete Todoist task.");
      }
    },
  );
}
