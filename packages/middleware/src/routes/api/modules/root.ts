import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import type { Module } from "@emstack/types";
import { db } from "@/db";
import { modules, moduleTags } from "@/db/schema";
import {
  nullableInteger,
  nullableResourceLevelEnum,
  nullableString,
  tagIdsArraySchema,
} from "@/utils/schemas";
import { v4 as uuidv4 } from "uuid";

import { coerceModuleLength } from "@/utils/moduleLength";

const listSchema = {
  schema: {
    description: "List modules (optionally filtered by resourceId or moduleGroupId)",
    querystring: {
      type: "object",
      properties: {
        resourceId: {
          type: "string",
        },
        moduleGroupId: {
          type: "string",
        },
      },
    },
  },
} as const;

const createSchema = {
  schema: {
    description: "Create a new module",
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
        moduleGroupId: nullableString,
        description: nullableString,
        url: nullableString,
        // Either an integer-as-string of exact minutes, or one of the
        // ModuleDurationBucket keys.
        length: nullableString,
        // @deprecated — accept for backwards compat; coerced into `length`.
        minutesLength: nullableInteger,
        isComplete: {
          type: "boolean",
        },
        position: nullableInteger,
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
      resourceId, moduleGroupId,
    } = request.query;
    const rows = await db.query.modules.findMany({
      where: (m, {
        and, eq,
      }) => {
        const conds = [];
        if (resourceId) conds.push(eq(m.resourceId, resourceId));
        if (moduleGroupId) conds.push(eq(m.moduleGroupId, moduleGroupId));
        if (conds.length === 0) return undefined;
        if (conds.length === 1) return conds[0];
        return and(...conds);
      },
      with: {
        moduleTags: {
          with: {
            tag: true,
          },
          orderBy: (j, {
            asc,
          }) => asc(j.position),
        },
      },
      orderBy: (m, {
        asc,
      }) => [asc(m.position), asc(m.name)],
    });
    const result: Module[] = rows.map(m => ({
      id: m.id,
      resourceId: m.resourceId,
      moduleGroupId: m.moduleGroupId,
      name: m.name,
      description: m.description,
      url: m.url,
      length: m.length,
      minutesLength: m.minutesLength,
      isComplete: m.isComplete,
      position: m.position,
      easeOfStarting: m.easeOfStarting ?? null,
      timeNeeded: m.timeNeeded ?? null,
      interactivity: m.interactivity ?? null,
      tags: (m.moduleTags ?? []).map(j => j.tag),
    }));
    return result;
  });

  fastify.post("/", createSchema, async function (request) {
    const body = request.body;
    const id = uuidv4();

    const length = coerceModuleLength(body.length, body.minutesLength);
    await db.insert(modules).values({
      id,
      resourceId: body.resourceId,
      moduleGroupId: body.moduleGroupId ?? null,
      name: body.name,
      description: body.description ?? null,
      url: body.url ?? null,
      length,
      minutesLength: null,
      isComplete: body.isComplete ?? false,
      position: body.position ?? null,
      easeOfStarting: body.easeOfStarting ?? null,
      timeNeeded: body.timeNeeded ?? null,
      interactivity: body.interactivity ?? null,
    });

    if (body.tagIds && body.tagIds.length > 0) {
      const unique = Array.from(new Set(body.tagIds));
      await db.insert(moduleTags).values(
        unique.map((tagId, index) => ({
          moduleId: id,
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
