import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import type { ModuleGroup } from "@emstack/types";
import { db } from "@/db";
import { moduleGroups, moduleGroupTags } from "@/db/schema";
import {
  nullableInteger,
  nullableResourceLevelEnum,
  nullableString,
  tagIdsArraySchema,
} from "@/utils/schemas";
import { v4 as uuidv4 } from "uuid";

const listSchema = {
  schema: {
    description: "List module groups (optionally filtered by resourceId)",
    querystring: {
      type: "object",
      properties: {
        resourceId: {
          type: "string",
        },
      },
    },
  },
} as const;

const createSchema = {
  schema: {
    description: "Create a new module group",
    body: {
      type: "object",
      required: ["name", "resourceId"],
      properties: {
        name: {
          type: "string",
          minLength: 1,
        },
        resourceId: {
          type: "string",
          minLength: 1,
        },
        description: nullableString,
        url: nullableString,
        position: nullableInteger,
        totalCount: nullableInteger,
        completedCount: nullableInteger,
        easeOfStarting: nullableResourceLevelEnum,
        timeNeeded: nullableResourceLevelEnum,
        interactivity: nullableResourceLevelEnum,
        tagIds: tagIdsArraySchema,
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get("/", listSchema, async function (request) {
    const {
      resourceId,
    } = request.query;
    const rows = await db.query.moduleGroups.findMany({
      where: resourceId
        ? (g, {
          eq: eqOp,
        }) => eqOp(g.resourceId, resourceId)
        : undefined,
      with: {
        modules: {
          orderBy: (m, {
            asc,
          }) => [asc(m.position), asc(m.name)],
        },
        moduleGroupTags: {
          with: {
            tag: true,
          },
          orderBy: (j, {
            asc,
          }) => asc(j.position),
        },
      },
      orderBy: (g, {
        asc,
      }) => [asc(g.position), asc(g.name)],
    });
    const result: ModuleGroup[] = rows.map(g => ({
      id: g.id,
      resourceId: g.resourceId,
      name: g.name,
      description: g.description,
      url: g.url,
      position: g.position,
      totalCount: g.totalCount,
      completedCount: g.completedCount,
      modules: g.modules,
      easeOfStarting: g.easeOfStarting ?? null,
      timeNeeded: g.timeNeeded ?? null,
      interactivity: g.interactivity ?? null,
      tags: (g.moduleGroupTags ?? []).map(j => j.tag),
    }));
    return result;
  });

  fastify.post("/", createSchema, async function (request) {
    const body = request.body;
    const id = uuidv4();

    await db.insert(moduleGroups).values({
      id,
      resourceId: body.resourceId,
      name: body.name,
      description: body.description ?? null,
      url: body.url ?? null,
      position: body.position ?? null,
      totalCount: body.totalCount ?? null,
      completedCount: body.completedCount ?? null,
      easeOfStarting: body.easeOfStarting ?? null,
      timeNeeded: body.timeNeeded ?? null,
      interactivity: body.interactivity ?? null,
    });

    if (body.tagIds && body.tagIds.length > 0) {
      const unique = Array.from(new Set(body.tagIds));
      await db.insert(moduleGroupTags).values(
        unique.map((tagId, index) => ({
          moduleGroupId: id,
          tagId,
          position: index,
        })),
      );
    }

    return {
      status: "ok",
      id,
    };
  });
}
