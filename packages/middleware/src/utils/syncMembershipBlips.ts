import { eq, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/db";
import { radarBlips } from "@/db/schema";

// A topic belongs to a domain iff a `radar_blips` row exists for that
// (domainId, topicId). When the domain or topic edit page sends a desired
// membership list we diff against existing blips: add new blips with NULL
// coordinates ("in domain, not yet placed"), drop blips for removed pairs.
// Existing blips with placement keep their quadrant/ring.

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
  const existingTopicIds = new Set(existing.map(b => b.topicId));
  const desiredSet = new Set(desiredTopicIds);

  const toRemoveIds = existing
    .filter(b => !desiredSet.has(b.topicId))
    .map(b => b.id);
  if (toRemoveIds.length > 0) {
    await db.delete(radarBlips).where(inArray(radarBlips.id, toRemoveIds));
  }

  const toAdd = desiredTopicIds.filter(t => !existingTopicIds.has(t));
  if (toAdd.length > 0) {
    await db.insert(radarBlips).values(
      toAdd.map(topicId => ({
        id: uuidv4(),
        domainId,
        topicId,
        quadrantId: null,
        ringId: null,
      })),
    );
  }
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
  const existingDomainIds = new Set(existing.map(b => b.domainId));
  const desiredSet = new Set(desiredDomainIds);

  const toRemoveIds = existing
    .filter(b => !desiredSet.has(b.domainId))
    .map(b => b.id);
  if (toRemoveIds.length > 0) {
    await db.delete(radarBlips).where(inArray(radarBlips.id, toRemoveIds));
  }

  const toAdd = desiredDomainIds.filter(d => !existingDomainIds.has(d));
  if (toAdd.length > 0) {
    await db.insert(radarBlips).values(
      toAdd.map(domainId => ({
        id: uuidv4(),
        domainId,
        topicId,
        quadrantId: null,
        ringId: null,
      })),
    );
  }
}

// Used for unrelated cleanup paths (e.g., "remove all blips for a domain").
export async function deleteAllBlipsForDomain(domainId: string) {
  await db.delete(radarBlips).where(eq(radarBlips.domainId, domainId));
}

export async function deleteAllBlipsForTopic(topicId: string) {
  await db.delete(radarBlips).where(eq(radarBlips.topicId, topicId));
}
