import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import {
  taskResources,
  taskTodos,
  tasks,
  tasksToResources,
  tasksToTags,
} from "@/db/schema";
import {
  nullableString,
  resourceLinksArraySchema,
  resourceSchema,
  tagIdsArraySchema,
  todoSchema,
} from "@/utils/schemas";
import { v4 as uuidv4 } from "uuid";

const createSchema = {
  schema: {
    description: "Create a new task",
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: {
          type: "string",
        },
        description: nullableString,
        topicId: nullableString,
        taskTypeId: nullableString,
        tagIds: tagIdsArraySchema,
        resourceLinks: resourceLinksArraySchema,
        resources: {
          type: "array",
          items: resourceSchema,
        },
        todos: {
          type: "array",
          items: todoSchema,
        },
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.post(
    "/",
    createSchema,
    async function (request) {
      const body = request.body;
      const id = uuidv4();

      await db.insert(tasks).values({
        id,
        name: body.name,
        description: body.description ?? null,
        topicId: body.topicId || null,
        taskTypeId: body.taskTypeId || null,
      });

      const uniqueTagIds = Array.from(new Set(body.tagIds ?? []));
      if (uniqueTagIds.length > 0) {
        await db.insert(tasksToTags).values(
          uniqueTagIds.map((tagId, index) => ({
            taskId: id,
            tagId,
            position: index,
          })),
        );
      }

      const incomingLinks = body.resourceLinks ?? [];
      if (incomingLinks.length > 0) {
        const seen = new Set<string>();
        const linkRows: {
          id: string;
          taskId: string;
          resourceId: string;
          moduleGroupId: string | null;
          moduleId: string | null;
          position: number;
        }[] = [];
        incomingLinks.forEach((link, index) => {
          const key = `${link.resourceId}|${link.moduleGroupId ?? ""}|${link.moduleId ?? ""}`;
          if (seen.has(key)) return;
          seen.add(key);
          linkRows.push({
            id: uuidv4(),
            taskId: id,
            resourceId: link.resourceId,
            moduleGroupId: link.moduleGroupId ?? null,
            moduleId: link.moduleId ?? null,
            position: index,
          });
        });
        if (linkRows.length > 0) {
          await db.insert(tasksToResources).values(linkRows);
        }
      }

      const incoming = body.resources ?? [];
      if (incoming.length > 0) {
        const resourceRows = incoming.map((r, index) => ({
          id: r.id || uuidv4(),
          taskId: id,
          name: r.name,
          url: r.url ?? null,
          usedYet: r.usedYet ?? false,
          position: index,
          resourceId: r.resourceId ?? null,
          moduleGroupId: r.resourceId ? r.moduleGroupId ?? null : null,
          moduleId: r.resourceId ? r.moduleId ?? null : null,
        }));
        await db.insert(taskResources).values(resourceRows);
      }

      const incomingTodos = body.todos ?? [];
      if (incomingTodos.length > 0) {
        await db.insert(taskTodos).values(
          incomingTodos.map((t, index) => ({
            id: t.id || uuidv4(),
            taskId: id,
            name: t.name,
            isComplete: t.isComplete ?? false,
            url: t.url ?? null,
            position: index,
          })),
        );
      }

      return {
        status: "ok",
        id,
      };
    },
  );
}
