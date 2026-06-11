import { sql } from "drizzle-orm";

import { db } from "@/db/index";

type ExistsRow = { exists: boolean } & Record<string, unknown>;

// Idempotent runtime migration that turns "out of scope" topics into ignored
// radar blips:
//   - adds `radar_blips.is_ignored` (a blip category, decoupled from rings)
//   - backfills the legacy `domain_excluded_topics` rows as ignored blips,
//     carrying the exclusion `reason` over to the blip `description`
//   - drops the now-empty `domain_excluded_topics` table
export async function migrateIgnoreBlips() {
  // Skip on a fresh DB where drizzle-kit push hasn't created tables yet — the
  // column ships in the schema, so push creates it for us.
  const blipsTableExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'radar_blips' AND table_schema = 'public'
    ) AS exists
  `);
  if (!blipsTableExists.rows[0]?.exists) {
    return;
  }

  await db.execute(sql`
    ALTER TABLE radar_blips
    ADD COLUMN IF NOT EXISTS is_ignored BOOLEAN NOT NULL DEFAULT false
  `);

  const excludedTableExists = await db.execute<ExistsRow>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'domain_excluded_topics' AND table_schema = 'public'
    ) AS exists
  `);
  if (!excludedTableExists.rows[0]?.exists) {
    return;
  }

  await db.transaction(async (tx) => {
    // Backfill an ignored blip per excluded topic that isn't already a blip.
    // A topic that is both excluded and already placed on the radar is
    // contradictory data; keep the existing blip and skip the exclusion.
    await tx.execute(sql`
      INSERT INTO radar_blips (id, domain_id, topic_id, quadrant_id, ring_id, description, is_ignored)
      SELECT gen_random_uuid()::text, det.domain_id, det.topic_id, NULL, NULL, det.reason, true
      FROM domain_excluded_topics det
      WHERE NOT EXISTS (
        SELECT 1 FROM radar_blips b
        WHERE b.domain_id = det.domain_id AND b.topic_id = det.topic_id
      )
    `);

    await tx.execute(sql`DROP TABLE domain_excluded_topics`);
  });
}
