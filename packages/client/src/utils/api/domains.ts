import type { Domain, ExploreData } from "@emstack/types";

import { createEntityClient, fetchJson } from "./client";

const domainsApi = createEntityClient<Domain>("domains", "domain");

export const fetchDomains = domainsApi.list;
export const fetchSingleDomain = domainsApi.get;
export const upsertDomain = domainsApi.upsert;
export const createDomain = domainsApi.create;
export const deleteSingleDomain = domainsApi.delete;
export const duplicateDomain = domainsApi.duplicate;

// Radar items across all domains for the "Explore Something" dashboard card.
export const fetchExplore = () => fetchJson<ExploreData>("/api/domains/explore");
