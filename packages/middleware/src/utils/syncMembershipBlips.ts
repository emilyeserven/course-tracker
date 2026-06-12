import { inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/db";
import { radarBlips } from "@/db/schema";

// A topic belongs to a domain iff a `radar_blips` row exists for that
// (domainId, topicId). When the domain or topic edit page sends a desired
// membership list we diff against existing blips: add new blips with NULL
// coordinates ("in domain, not yet placed"), drop blips for removed pairs.
// Existing blips with placement keep their quadrant/ring.

// Shared diff core: each existing blip is keyed by its "other side" id
// (topicId when syncing a domain, domainId when syncing a topic). Stale
// blips are deleted, missing pairs inserted via buildRow.
async function syncBlipsByKey(
  existing: { id: string;
    key: string; }[],
  desiredKeys: string[],
  buildRow: (key: string) => typeof radarBlips.$inferInsert,
) {
  const existingKeys = new Set(existing.map(b => b.key));
  const desiredSet = new Set(desiredKeys);

  const toRemoveIds = existing
    .filter(b => !desiredSet.has(b.key))
    .map(b => b.id);
  if (toRemoveIds.length > 0) {
    await db.delete(radarBlips).where(inArray(radarBlips.id, toRemoveIds));
  }

  const toAdd = desiredKeys.filter(k => !existingKeys.has(k));
  if (toAdd.length > 0) {
    await db.insert(radarBlips).values(toAdd.map(buildRow));
  }
}

export async function syncDomainMembershipByDomain(
  domainId: string,
  desiredTopicIds: string[],
) {
  const existing = await db.query.radarBlips.findMany({
    where: (b, {
      eq: e,
    }) => e(b.domainId, domainId),
    columns: {
      id: true,
      topicId: true,
    },
  });
  await syncBlipsByKey(
    existing.map(b => ({
      id: b.id,
      key: b.topicId,
    })),
    desiredTopicIds,
    topicId => ({
      id: uuidv4(),
      domainId,
      topicId,
      quadrantId: null,
      ringId: null,
    }),
  );
}

export async function syncDomainMembershipByTopic(
  topicId: string,
  desiredDomainIds: string[],
) {
  const existing = await db.query.radarBlips.findMany({
    where: (b, {
      eq: e,
    }) => e(b.topicId, topicId),
    columns: {
      id: true,
      domainId: true,
    },
  });
  await syncBlipsByKey(
    existing.map(b => ({
      id: b.id,
      key: b.domainId,
    })),
    desiredDomainIds,
    domainId => ({
      id: uuidv4(),
      domainId,
      topicId,
      quadrantId: null,
      ringId: null,
    }),
  );
}
