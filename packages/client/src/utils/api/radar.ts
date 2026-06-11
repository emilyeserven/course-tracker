import type { CreateResponse, SuccessObj } from "./client";
import type { Radar } from "@emstack/types";

import { deleteJson, fetchJson, postJson, putJson } from "./client";

export async function fetchRadar(domainId: string): Promise<Radar> {
  return fetchJson<Radar>(`/api/domains/${domainId}/radar`);
}

interface RadarConfigPayload {
  quadrants: { id?: string;
    name: string;
    position: number; }[];
  rings: { id?: string;
    name: string;
    position: number;
    isAdopted?: boolean; }[];
  hasAdoptedSection?: boolean;
}

export async function upsertRadarConfig(
  domainId: string,
  data: RadarConfigPayload,
): Promise<SuccessObj> {
  return putJson(
    `/api/domains/${domainId}/radar`,
    data,
    "Failed to save radar config",
  );
}

interface BlipPayload {
  topicId: string;
  description?: string | null;
  quadrantId?: string | null;
  ringId?: string | null;
  isIgnored?: boolean | null;
}

export async function createRadarBlip(
  domainId: string,
  data: BlipPayload,
): Promise<CreateResponse> {
  return postJson(
    `/api/domains/${domainId}/radar/blips`,
    data,
    "Failed to create blip",
  );
}

export async function upsertRadarBlip(
  domainId: string,
  blipId: string,
  data: BlipPayload,
): Promise<SuccessObj> {
  return putJson(
    `/api/domains/${domainId}/radar/blips/${blipId}`,
    data,
    "Failed to update blip",
  );
}

export async function deleteRadarBlip(
  domainId: string,
  blipId: string,
): Promise<SuccessObj> {
  return deleteJson(
    `/api/domains/${domainId}/radar/blips/${blipId}`,
    "Failed to delete blip",
  );
}

export interface BulkBlipEntry {
  topicId?: string | null;
  newTopicName?: string | null;
  newTopicDescription?: string | null;
  description?: string | null;
  quadrantId?: string | null;
  ringId?: string | null;
}

export async function bulkCreateRadarBlips(
  domainId: string,
  data: { blips: BulkBlipEntry[] },
): Promise<{ status: string;
  count: number;
  ids: string[];
  skippedDuplicates?: number; }> {
  return postJson(
    `/api/domains/${domainId}/radar/blips/bulk`,
    data,
    "Failed to bulk-create blips",
  );
}
