import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { db } from "@/db";
import type { ExploreData, ExploreItem } from "@emstack/types";

const exploreSchema = {
  schema: {
    description:
      "Radar items (non-ignored blips) across all domains, with each blip's ring resolved to its name. Powers the dashboard's \"Explore Something\" card.",
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.get(
    "/explore",
    exploreSchema,
    async (): Promise<ExploreData> => {
      const domains = await db.query.domains.findMany({
        with: {
          radarBlips: {
            with: {
              topic: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      const items: ExploreItem[] = [];
      // name -> smallest ring position seen, so the selector lists rings in the
      // usual radar order (Adopt, Trial, …) rather than alphabetically.
      const ringPositions = new Map<string, number>();

      for (const domain of domains) {
        const rings = domain.radarConfig?.rings ?? [];
        const ringNameById = new Map(rings.map(r => [r.id, r.name]));

        for (const ring of rings) {
          const prev = ringPositions.get(ring.name);
          if (prev === undefined || ring.position < prev) {
            ringPositions.set(ring.name, ring.position);
          }
        }

        for (const blip of domain.radarBlips ?? []) {
          if (blip.isIgnored) continue;
          items.push({
            topicId: blip.topicId,
            topicName: blip.topic?.name ?? "",
            domainId: domain.id,
            domainTitle: domain.title,
            ringName: blip.ringId ? ringNameById.get(blip.ringId) ?? null : null,
          });
        }
      }

      const ringNames = [...ringPositions.keys()].sort((a, b) => {
        const posDiff = (ringPositions.get(a) ?? 0) - (ringPositions.get(b) ?? 0);
        return posDiff !== 0 ? posDiff : a.localeCompare(b);
      });

      return {
        rings: ringNames,
        items,
      };
    },
  );
}
