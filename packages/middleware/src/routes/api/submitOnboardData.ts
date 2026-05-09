import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { resources, topics, topicsToResources } from "@/db/schema";
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
        topics: {
          type: "array",
          items: {
            type: "string",
          },
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
              topic: {
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
  topic?: string;
  url?: string;
  id?: string;
}

function makeTopicData(topicData: string[] | undefined) {
  if (topicData) {
    return topicData.map((topic: string) => {
      return {
        id: uuidv4(),
        name: topic,
      };
    });
  }
  return [];
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

      const topicsData = makeTopicData(request.body.topics);

      const reqCourses = request.body.resources;

      const resourcesData = makeCourseData(reqCourses);

      if (resourcesData && reqCourses) {
        const topicsDb = await db.insert(topics).values(topicsData).onConflictDoNothing().returning();
        const coursesDb = await db.insert(resources).values(resourcesData).onConflictDoNothing().returning();

        coursesDb.map(async (course) => {
          const courseTopicName = reqCourses.find(resources => course.name === resources.name);
          if (courseTopicName) {
            const courseTopic = topicsDb.find(topic => topic.name === courseTopicName.topic);

            if (courseTopic) {
              await db.insert(topicsToResources).values([{
                resourceId: course.id,
                topicId: courseTopic.id,
              }]).onConflictDoNothing();
            }
          }
        });

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
