import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import type { DailyCompletion, Domain, LearningLogEntry } from "@emstack/types/src";
import { idParamSchema } from "@/utils/schemas";
import { buildDomainLearningLog } from "@/utils/learningLog";

const getDomainSchema = {
  schema: {
    description: "Get a single domain by ID",
    params: idParamSchema,
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/:id",
    getDomainSchema,
    async function (request, reply) {
      const {
        id,
      } = request.params;
      const domain = await db.query.domains.findFirst({
        where: (domains, {
          eq,
        }) => (eq(domains.id, id)),
        with: {
          topicsToDomains: {
            with: {
              topic: {
                with: {
                  topicsToCourses: {
                    with: {
                      course: {
                        columns: {
                          id: true,
                          name: true,
                          progressCurrent: true,
                          progressTotal: true,
                          status: true,
                        },
                        with: {
                          dailies: {
                            columns: {
                              id: true,
                              name: true,
                              completions: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          excludedTopics: {
            with: {
              topic: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          learningLogEntries: true,
        },
      });

      if (!domain) {
        reply.status(404);
        return {
          error: "Domain not found",
        };
      }

      const topics = domain.topicsToDomains
        .map((ttd) => {
          if (!ttd.topic) {
            return null;
          }
          const courses = (ttd.topic.topicsToCourses ?? [])
            .map(ttc => ttc.course)
            .filter((c): c is NonNullable<typeof c> => Boolean(c))
            .map(c => ({
              id: c.id,
              name: c.name,
              progressCurrent: c.progressCurrent ?? null,
              progressTotal: c.progressTotal ?? null,
              status: c.status ?? null,
            }));
          return {
            id: ttd.topic.id,
            name: ttd.topic.name,
            description: ttd.topic.description ?? null,
            reason: ttd.topic.reason ?? null,
            courses,
          };
        })
        .filter((t): t is NonNullable<typeof t> => Boolean(t));

      const excludedTopics = (domain.excludedTopics ?? [])
        .map((row) => {
          if (!row.topic) {
            return null;
          }
          return {
            id: row.topic.id,
            name: row.topic.name,
            reason: row.reason ?? null,
          };
        })
        .filter((row): row is NonNullable<typeof row> => Boolean(row));

      const dailySource = domain.topicsToDomains.flatMap((ttd) => {
        if (!ttd.topic) {
          return [];
        }
        return (ttd.topic.topicsToCourses ?? []).flatMap((ttc) => {
          const course = ttc.course;
          if (!course) {
            return [];
          }
          return (course.dailies ?? []).map(d => ({
            id: d.id,
            name: d.name,
            completions: (d.completions ?? []) as DailyCompletion[],
            courseId: course.id,
            courseName: course.name,
          }));
        });
      });

      const learningLog: LearningLogEntry[] = buildDomainLearningLog(
        domain.learningLogEntries ?? [],
        dailySource,
      );

      const result: Domain = {
        id: domain.id,
        title: domain.title,
        description: domain.description,
        hasRadar: domain.hasRadar,
        topicCount: topics.length,
        topics,
        excludedTopics,
        learningLog,
      };

      return result;
    },
  );
}
