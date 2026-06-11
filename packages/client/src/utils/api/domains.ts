import type { Domain } from "@emstack/types";

import { createEntityClient } from "./client";

export const domainsApi = createEntityClient<Domain>("domains", "domain");

export const fetchDomains = domainsApi.list;
export const fetchSingleDomain = domainsApi.get;
export const upsertDomain = domainsApi.upsert;
export const createDomain = domainsApi.create;
export const deleteSingleDomain = domainsApi.delete;
export const duplicateDomain = domainsApi.duplicate;
