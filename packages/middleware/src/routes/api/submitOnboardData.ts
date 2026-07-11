import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { resources } from "@/db/schema";
import { db } from "@/db";
import { v4 as uuidv4 } from "uuid";

const testSchema = {
  schema: {
    description: "It's like looking into a mirror...",
    body: {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
        resources: {
          type: "array",
          items: {
            type: "object",
            required: ["name"],
            properties: {
              name: {
                type: "string",
              },
              url: {
                type: "string",
              },
              id: {
                type: "string",
              },
            },
          },
        },
      },
    },
  },
} as const;

interface FormCourseData {
  [x: string]: unknown;
  name: string;
  url?: string;
  id?: string;
}

function makeCourseData(courseData: FormCourseData[] | undefined) {
  if (courseData) {
    return courseData.map((course) => {
      return {
        id: uuidv4(),
        name: course.name,
        url: course.url,
        isCostFromPlatform: false,
      };
    });
  }
  return [];
}

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.post(
    "/submitOnboardData",
    testSchema,
    async (request, reply) => {
      // make user or edit user with name, url param for user? session thing? idk

      const reqCourses = request.body.resources;

      const resourcesData = makeCourseData(reqCourses);

      if (resourcesData && reqCourses) {
        await db.insert(resources).values(resourcesData).onConflictDoNothing().returning();

        return {
          status: "ok",
        };
      }
      return {
        status: "error",
      };
    },
  );
}
