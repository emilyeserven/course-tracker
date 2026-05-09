import type {
  Course,
  CourseInCourses,
  TopicForTopicsPage,
  CourseProvider,
  DailyCriteriaTemplate,
  Domain,
  Daily,
  Radar,
  Task,
  TaskType,
} from "@emstack/types/src/index.js";
import type { OnboardData } from "@emstack/types/src/OnboardData";
import type { Topic } from "@emstack/types/src/Topic";

interface SuccessObj {
  status: string;
}

interface CreateResponse {
  status: string;
  id: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Request to ${url} failed (${response.status} ${response.statusText})`,
    );
  }
  return await response.json();
}

async function postJson<T>(
  url: string,
  data?: object,
  errorLabel?: string,
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    ...(data === undefined
      ? {}
      : {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `${errorLabel ?? `POST ${url}`} failed (${response.status} ${response.statusText})${body ? `: ${body}` : ""}`,
    );
  }
  return await response.json();
}

async function putJson<T>(
  url: string,
  data: object,
  errorLabel?: string,
): Promise<T> {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `${errorLabel ?? `PUT ${url}`} failed (${response.status} ${response.statusText})${body ? `: ${body}` : ""}`,
    );
  }
  return await response.json();
}

async function deleteJson<T>(url: string, errorLabel?: string): Promise<T> {
  const response = await fetch(url, {
    method: "DELETE",
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let serverMessage: string | undefined;
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed.message === "string") {
          serverMessage = parsed.message;
        }
      }
      catch {
        serverMessage = text;
      }
    }
    throw new Error(
      serverMessage
      ?? `${errorLabel ?? `DELETE ${url}`} failed (${response.status} ${response.statusText})`,
    );
  }
  return await response.json();
}

interface EntityClient<TEntity, TList> {
  list: () => Promise<TList>;
  get: (id: string) => Promise<TEntity>;
  create: (data: Record<string, unknown>) => Promise<CreateResponse>;
  upsert: (id: string, data: Record<string, unknown>) => Promise<SuccessObj>;
  delete: (id: string) => Promise<SuccessObj>;
  duplicate: (id: string) => Promise<CreateResponse>;
}

function createEntityClient<TEntity, TList = TEntity[]>(
  endpoint: string,
  label: string,
): EntityClient<TEntity, TList> {
  const base = `/api/${endpoint}`;
  return {
    list: () => fetchJson<TList>(base),
    get: id => fetchJson<TEntity>(`${base}/${id}`),
    create: data =>
      postJson<CreateResponse>(base, data, `Failed to create ${label}`),
    upsert: (id, data) =>
      putJson<SuccessObj>(`${base}/${id}`, data, `Failed to update ${label}`),
    delete: id =>
      deleteJson<SuccessObj>(`${base}/${id}`, `Failed to delete ${label}`),
    duplicate: id =>
      postJson<CreateResponse>(
        `${base}/${id}/duplicate`,
        undefined,
        `Failed to duplicate ${label}`,
      ),
  };
}

export const coursesApi = createEntityClient<Course, CourseInCourses[]>(
  "courses",
  "course",
);
export const topicsApi = createEntityClient<Topic, TopicForTopicsPage[]>(
  "topics",
  "topic",
);
export const providersApi = createEntityClient<CourseProvider>(
  "providers",
  "provider",
);
export const domainsApi = createEntityClient<Domain>("domains", "domain");
export const dailiesApi = createEntityClient<Daily>("dailies", "daily");
export const tasksApi = createEntityClient<Task>("tasks", "task");
export const taskTypesApi = createEntityClient<TaskType>(
  "task-types",
  "task type",
);
export const dailyCriteriaTemplatesApi = createEntityClient<DailyCriteriaTemplate>(
  "daily-criteria-templates",
  "criteria template",
);

export const fetchTopics = topicsApi.list;
export const fetchProviders = providersApi.list;
export const fetchCourses = coursesApi.list;
export const fetchDomains = domainsApi.list;
export const fetchDailies = dailiesApi.list;
export const fetchTasks = tasksApi.list;
export const fetchTaskTypes = taskTypesApi.list;
export const fetchDailyCriteriaTemplates = dailyCriteriaTemplatesApi.list;

export const fetchSingleCourse = coursesApi.get;
export const fetchSingleTopic = topicsApi.get;
export const fetchSingleProvider = providersApi.get;
export const fetchSingleDomain = domainsApi.get;
export const fetchSingleDaily = dailiesApi.get;
export const fetchSingleTask = tasksApi.get;

export const upsertCourse = coursesApi.upsert;
export const upsertTopic = topicsApi.upsert;
export const upsertProvider = providersApi.upsert;
export const upsertDomain = domainsApi.upsert;
export const upsertDaily = dailiesApi.upsert;
export const upsertTask = tasksApi.upsert;
export const upsertTaskType = taskTypesApi.upsert;
export const upsertDailyCriteriaTemplate = dailyCriteriaTemplatesApi.upsert;

export const createTopic = topicsApi.create;
export const createProvider = providersApi.create;
export const createDomain = domainsApi.create;
export const createDaily = dailiesApi.create;
export const createTask = tasksApi.create;
export const createTaskType = taskTypesApi.create;
export const createDailyCriteriaTemplate = dailyCriteriaTemplatesApi.create;

export const deleteSingleCourse = coursesApi.delete;
export const deleteSingleTopic = topicsApi.delete;

export async function bulkDeleteTopics(
  ids: string[],
): Promise<{ status: string;
  count: number; }> {
  return postJson(
    "/api/topics/bulk-delete",
    {
      ids,
    },
    "Failed to delete topics",
  );
}

export const deleteSinglePlatform = providersApi.delete;
export const deleteSingleDomain = domainsApi.delete;
export const deleteSingleDaily = dailiesApi.delete;
export const deleteSingleTask = tasksApi.delete;
export const deleteSingleTaskType = taskTypesApi.delete;
export const deleteSingleDailyCriteriaTemplate = dailyCriteriaTemplatesApi.delete;

export const duplicateCourse = coursesApi.duplicate;
export const duplicateDomain = domainsApi.duplicate;
export const duplicateDaily = dailiesApi.duplicate;

export async function fetchSeed(): Promise<SuccessObj> {
  return await fetch("/api/seed").then(res => res.json());
}

export async function fetchClear(): Promise<SuccessObj> {
  return await fetch("/api/clearData").then(res => res.json());
}

export async function incrementCourseProgress(
  id: string,
): Promise<{
  status: string;
  id: string;
  progressCurrent: number;
  progressTotal: number;
}> {
  return postJson(
    `/api/courses/${id}/incrementProgress`,
    undefined,
    "Failed to increment course progress",
  );
}

export async function postOnboardForm(
  formData: OnboardData,
): Promise<SuccessObj> {
  return await fetch("/api/submitOnboardData", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  }).then(res => res.json());
}

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
