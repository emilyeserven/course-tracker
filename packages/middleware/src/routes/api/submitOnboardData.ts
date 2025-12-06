import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { courses, topics, topicsToCourses } from "@/db/schema";
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
        courses: {
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

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.post(
    "/submitOnboardData",
    testSchema,
    async (request, reply) => {
      console.log(request.body);

      // make user or edit user with name, url param for user? session thing? idk

      const topicsData = request.body.topics
        ? request.body.topics.map((topic: string) => {
          return {
            id: uuidv4(),
            name: topic,
          };
        })
        : [];

      const reqCourses = request.body.courses;

      const coursesData = request.body.courses
        ? request.body.courses.map((course) => {
          return {
            id: uuidv4(),
            name: course.name,
            url: course.url,
            isCostFromPlatform: false,
          };
        })
        : [];
      if (coursesData) {
        const topicsDb = await db.insert(topics).values(topicsData).onConflictDoNothing().returning();
        const coursesDb = await db.insert(courses).values(coursesData).onConflictDoNothing().returning();

        if (reqCourses) {
          coursesDb.map(async (course) => {
            console.log("topicsDb", topicsDb);
            const courseTopicName = reqCourses.find(courses => course.name === courses.name);
            console.log("courseTopicName", courseTopicName);
            if (courseTopicName) {
              const courseTopic = topicsDb.find(topic => topic.name === courseTopicName.topic);

              console.log("courseTopic", courseTopic);
              if (courseTopic) {
                await db.insert(topicsToCourses).values([{
                  courseId: course.id,
                  topicId: courseTopic.id,
                }]).onConflictDoNothing();
              }
            }
          });
        }

        console.log("topics", topicsDb);
        console.log("courses", coursesDb);
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
