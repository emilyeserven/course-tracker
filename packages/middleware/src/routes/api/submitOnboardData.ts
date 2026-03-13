import { ZodTypeProvider } from "fastify-type-provider-zod";
import { FastifyInstance } from "fastify";
import { courses, topics, topicsToCourses } from "@/db/schema";
import { db } from "@/db";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const submitSchema = {
  schema: {
    description: "It's like looking into a mirror...",
    body: z.object({
      name: z.string(),
      topics: z.array(z.string()),
      courses: z.array(z.object({
        name: z.string(),
        topic: z.string().optional(),
        url: z.string().optional(),
        id: z.string().optional(),
      })),
    }),
  },
};

interface FormCourseData {
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
  const fastify = server.withTypeProvider<ZodTypeProvider>();

  fastify.post(
    "/submitOnboardData",
    submitSchema,
    async (request, reply) => {
      // make user or edit user with name, url param for user? session thing? idk

      const topicsData = makeTopicData(request.body.topics);

      const reqCourses = request.body.courses;

      const coursesData = makeCourseData(reqCourses);

      if (coursesData && reqCourses) {
        const topicsDb = await db.insert(topics).values(topicsData).onConflictDoNothing().returning();
        const coursesDb = await db.insert(courses).values(coursesData).onConflictDoNothing().returning();

        coursesDb.map(async (course) => {
          const courseTopicName = reqCourses.find(courses => course.name === courses.name);
          if (courseTopicName) {
            const courseTopic = topicsDb.find(topic => topic.name === courseTopicName.topic);

            if (courseTopic) {
              await db.insert(topicsToCourses).values([{
                courseId: course.id,
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
