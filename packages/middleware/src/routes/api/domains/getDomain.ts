import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import type { DailyCompletion, DailyCriteria, Domain, LearningLogEntry } from "@emstack/types/src";
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
                              criteria: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  tasks: {
                    columns: {
                      id: true,
                      name: true,
                    },
                    with: {
                      daily: {
                        columns: {
                          id: true,
                          name: true,
                          completions: true,
                          criteria: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          radarBlips: {
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
                              criteria: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  tasks: {
                    columns: {
                      id: true,
                      name: true,
                    },
                    with: {
                      daily: {
                        columns: {
                          id: true,
                          name: true,
                          completions: true,
                          criteria: true,
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

      const topicsById = new Map<string, {
        id: string;
        name: string;
        description: string | null;
        reason: string | null;
        courses: {
          id: string;
          name: string;
          progressCurrent: number | null;
          progressTotal: number | null;
          status: string | null;
        }[];
      }>();

      function addTopic(topic: {
        id: string;
        name: string;
        description?: string | null;
        reason?: string | null;
        topicsToCourses?: { course: {
          id: string;
          name: string;
          progressCurrent: number | null;
          progressTotal: number | null;
          status: string | null;
        } | null; }[];
      } | null | undefined) {
        if (!topic || topicsById.has(topic.id)) {
          return;
        }
        const courses = (topic.topicsToCourses ?? [])
          .map(ttc => ttc.course)
          .filter((c): c is NonNullable<typeof c> => Boolean(c))
          .map(c => ({
            id: c.id,
            name: c.name,
            progressCurrent: c.progressCurrent ?? null,
            progressTotal: c.progressTotal ?? null,
            status: c.status ?? null,
          }));
        topicsById.set(topic.id, {
          id: topic.id,
          name: topic.name,
          description: topic.description ?? null,
          reason: topic.reason ?? null,
          courses,
        });
      }

      for (const ttd of domain.topicsToDomains) {
        addTopic(ttd.topic);
      }
      for (const blip of domain.radarBlips ?? []) {
        addTopic(blip.topic);
      }

      const topics = Array.from(topicsById.values());

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

      const dailySourceMap = new Map<string, {
        id: string;
        name: string;
        completions: DailyCompletion[];
        criteria?: DailyCriteria | null;
        courseId?: string | null;
        courseName?: string | null;
        taskId?: string | null;
        taskName?: string | null;
      }>();

      function addDailiesFromTopic(topic: {
        topicsToCourses?: { course: {
          id: string;
          name: string;
          dailies?: {
            id: string;
            name: string;
            completions?: DailyCompletion[] | null;
            criteria?: DailyCriteria | null;
          }[];
        } | null; }[];
        tasks?: {
          id: string;
          name: string;
          daily?: {
            id: string;
            name: string;
            completions?: DailyCompletion[] | null;
            criteria?: DailyCriteria | null;
          } | null;
        }[];
      } | null | undefined) {
        if (!topic) return;
        for (const ttc of topic.topicsToCourses ?? []) {
          const course = ttc.course;
          if (!course) continue;
          for (const d of course.dailies ?? []) {
            const existing = dailySourceMap.get(d.id);
            if (existing) {
              if (!existing.courseId) {
                existing.courseId = course.id;
                existing.courseName = course.name;
              }
              continue;
            }
            dailySourceMap.set(d.id, {
              id: d.id,
              name: d.name,
              completions: (d.completions ?? []) as DailyCompletion[],
              criteria: (d.criteria ?? null) as DailyCriteria | null,
              courseId: course.id,
              courseName: course.name,
            });
          }
        }
        for (const task of topic.tasks ?? []) {
          const d = task.daily;
          if (!d) continue;
          const existing = dailySourceMap.get(d.id);
          if (existing) {
            if (!existing.taskId) {
              existing.taskId = task.id;
              existing.taskName = task.name;
            }
            continue;
          }
          dailySourceMap.set(d.id, {
            id: d.id,
            name: d.name,
            completions: (d.completions ?? []) as DailyCompletion[],
            criteria: (d.criteria ?? null) as DailyCriteria | null,
            taskId: task.id,
            taskName: task.name,
          });
        }
      }

      for (const ttd of domain.topicsToDomains) {
        addDailiesFromTopic(ttd.topic);
      }
      for (const blip of domain.radarBlips ?? []) {
        addDailiesFromTopic(blip.topic);
      }

      const dailySource = Array.from(dailySourceMap.values());

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
