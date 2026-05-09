import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  taskResources,
  taskResourcesToTags,
  taskTodos,
  tasks,
  tasksToResources,
  tasksToTags,
} from "@/db/schema";
import {
  idParamSchema,
  nullableString,
  resourceLinksArraySchema,
  resourceSchema,
  tagIdsArraySchema,
  todoSchema,
} from "@/utils/schemas";
import { v4 as uuidv4 } from "uuid";

const upsertSchema = {
  schema: {
    description: "Update a task and its resources",
    params: idParamSchema,
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

  fastify.put(
    "/:id",
    upsertSchema,
    async function (request) {
      const {
        id,
      } = request.params;
      const body = request.body;

      const taskData = {
        id,
        name: body.name,
        description: body.description ?? null,
        topicId: body.topicId || null,
        taskTypeId: body.taskTypeId || null,
      };

      await db
        .insert(tasks)
        .values(taskData)
        .onConflictDoUpdate({
          target: tasks.id,
          set: {
            name: taskData.name,
            description: taskData.description,
            topicId: taskData.topicId,
            taskTypeId: taskData.taskTypeId,
          },
        });

      if (body.tagIds !== undefined) {
        await db.delete(tasksToTags).where(eq(tasksToTags.taskId, id));
        const uniqueTagIds = Array.from(new Set(body.tagIds));
        if (uniqueTagIds.length > 0) {
          await db.insert(tasksToTags).values(
            uniqueTagIds.map((tagId, index) => ({
              taskId: id,
              tagId,
              position: index,
            })),
          );
        }
      }

      if (body.resourceLinks !== undefined) {
        await db.delete(tasksToResources).where(eq(tasksToResources.taskId, id));
        // Dedupe by resourceId — PK is (taskId, resourceId), one link per pair.
        const seen = new Set<string>();
        const rows: {
          taskId: string;
          resourceId: string;
          moduleGroupId: string | null;
          moduleId: string | null;
          position: number;
        }[] = [];
        body.resourceLinks.forEach((link, index) => {
          if (seen.has(link.resourceId)) return;
          seen.add(link.resourceId);
          rows.push({
            taskId: id,
            resourceId: link.resourceId,
            moduleGroupId: link.moduleGroupId ?? null,
            moduleId: link.moduleId ?? null,
            position: index,
          });
        });
        if (rows.length > 0) {
          await db.insert(tasksToResources).values(rows);
        }
      }

      if (body.resources !== undefined) {
        const existingResourceIds = (
          await db
            .select({
              id: taskResources.id,
            })
            .from(taskResources)
            .where(eq(taskResources.taskId, id))
        ).map(r => r.id);
        if (existingResourceIds.length > 0) {
          await db
            .delete(taskResourcesToTags)
            .where(inArray(taskResourcesToTags.resourceId, existingResourceIds));
        }
        await db.delete(taskResources).where(eq(taskResources.taskId, id));

        if (body.resources.length > 0) {
          const resourceRows = body.resources.map((r, index) => ({
            id: r.id || uuidv4(),
            taskId: id,
            name: r.name,
            url: r.url ?? null,
            easeOfStarting: r.easeOfStarting ?? null,
            timeNeeded: r.timeNeeded ?? null,
            interactivity: r.interactivity ?? null,
            usedYet: r.usedYet ?? false,
            position: index,
          }));
          await db.insert(taskResources).values(resourceRows);

          const tagJunctionRows: {
            resourceId: string;
            tagId: string;
            position: number;
          }[] = [];
          body.resources.forEach((r, index) => {
            const resourceId = resourceRows[index].id;
            const uniqueTagIds = Array.from(new Set(r.tagIds ?? []));
            uniqueTagIds.forEach((tagId, tagIndex) => {
              tagJunctionRows.push({
                resourceId,
                tagId,
                position: tagIndex,
              });
            });
          });
          if (tagJunctionRows.length > 0) {
            await db.insert(taskResourcesToTags).values(tagJunctionRows);
          }
        }
      }

      if (body.todos !== undefined) {
        await db.delete(taskTodos).where(eq(taskTodos.taskId, id));
        if (body.todos.length > 0) {
          await db.insert(taskTodos).values(
            body.todos.map((t, index) => ({
              id: t.id || uuidv4(),
              taskId: id,
              name: t.name,
              isComplete: t.isComplete ?? false,
              url: t.url ?? null,
              position: index,
            })),
          );
        }
      }

      return {
        status: "ok",
      };
    },
  );
}
