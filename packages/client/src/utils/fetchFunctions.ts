import type {
  Test,
  DbTest,
  Course,
  CourseInCourses,
  TopicForTopicsPage,
  CourseProvider,
  Domain,
  Daily,
  Radar,
  Task,
} from "@emstack/types/src/index.js";
import type { OnboardData } from "@emstack/types/src/OnboardData";
import type { Topic } from "@emstack/types/src/Topic";

interface SuccessObj {
  status: string;
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

export async function fetchTest(): Promise<Test> {
  return fetchJson<Test>("/api");
}

export async function fetchDbTest(): Promise<DbTest[]> {
  return fetchJson<DbTest[]>("/api/dbTest");
}

export async function fetchTopics(): Promise<TopicForTopicsPage[]> {
  return fetchJson<TopicForTopicsPage[]>("/api/topics");
}

export async function fetchProviders(): Promise<CourseProvider[]> {
  return fetchJson<CourseProvider[]>("/api/providers");
}

export async function fetchCourses(): Promise<CourseInCourses[]> {
  return fetchJson<CourseInCourses[]>("/api/courses");
}

export async function deleteSingleCourse(id: string): Promise<Course> {
  console.log("delete single course");
  return await fetch(`/api/courses/${id}`, {
    method: "DELETE",
  }).then(res => res.json());
}

export async function deleteSinglePlatform(id: string): Promise<Course> {
  console.log("delete single platform");
  return await fetch(`/api/providers/${id}`, {
    method: "DELETE",
  }).then(res => res.json());
}

export async function deleteSingleTopic(id: string): Promise<Course> {
  console.log("delete single topic");
  return await fetch(`/api/topics/${id}`, {
    method: "DELETE",
  }).then(res => res.json());
}

export async function fetchSingleCourse(id: string): Promise<Course> {
  return fetchJson<Course>(`/api/courses/${id}`);
}

export async function fetchSingleTopic(id: string): Promise<Topic> {
  return fetchJson<Topic>(`/api/topics/${id}`);
}

export async function fetchSingleProvider(id: string): Promise<CourseProvider> {
  return fetchJson<CourseProvider>(`/api/providers/${id}`);
}

export async function fetchSeed(): Promise<SuccessObj> {
  return await fetch("/api/seed").then(res => res.json());
}

export async function fetchClear(): Promise<SuccessObj> {
  return await fetch("/api/clearData").then(res => res.json());
}

export async function upsertCourse(
  id: string,
  data: Record<string, unknown>,
): Promise<SuccessObj> {
  const response = await fetch(`/api/courses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to update course (${response.status} ${response.statusText}): ${body}`,
    );
  }
  return await response.json();
}

export async function incrementCourseProgress(
  id: string,
): Promise<{
  status: string;
  id: string;
  progressCurrent: number;
  progressTotal: number;
}> {
  const response = await fetch(`/api/courses/${id}/incrementProgress`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to increment course progress: ${response.statusText}`);
  }
  return await response.json();
}

export async function createTopic(
  data: Record<string, unknown>,
): Promise<{ status: string;
  id: string; }> {
  const response = await fetch("/api/topics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to create topic: ${response.statusText}`);
  }
  return await response.json();
}

export async function upsertTopic(
  id: string,
  data: Record<string, unknown>,
): Promise<SuccessObj> {
  const response = await fetch(`/api/topics/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to update topic: ${response.statusText}`);
  }
  return await response.json();
}

export async function createProvider(
  data: Record<string, unknown>,
): Promise<{ status: string;
  id: string; }> {
  const response = await fetch("/api/providers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to create provider: ${response.statusText}`);
  }
  return await response.json();
}

export async function upsertProvider(
  id: string,
  data: Record<string, unknown>,
): Promise<SuccessObj> {
  const response = await fetch(`/api/providers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to update provider: ${response.statusText}`);
  }
  return await response.json();
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

export async function fetchDomains(): Promise<Domain[]> {
  return fetchJson<Domain[]>("/api/domains");
}

export async function fetchSingleDomain(id: string): Promise<Domain> {
  return fetchJson<Domain>(`/api/domains/${id}`);
}

export async function deleteSingleDomain(
  id: string,
): Promise<{ status: string }> {
  return await fetch(`/api/domains/${id}`, {
    method: "DELETE",
  }).then(res => res.json());
}

export async function createDomain(
  data: Record<string, unknown>,
): Promise<{ status: string;
  id: string; }> {
  const response = await fetch("/api/domains", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to create domain: ${response.statusText}`);
  }
  return await response.json();
}

export async function upsertDomain(
  id: string,
  data: Record<string, unknown>,
): Promise<SuccessObj> {
  const response = await fetch(`/api/domains/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to update domain: ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchDailies(): Promise<Daily[]> {
  return fetchJson<Daily[]>("/api/dailies");
}

export async function fetchSingleDaily(id: string): Promise<Daily> {
  return fetchJson<Daily>(`/api/dailies/${id}`);
}

export async function createDaily(
  data: Record<string, unknown>,
): Promise<{ status: string;
  id: string; }> {
  const response = await fetch("/api/dailies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to create daily: ${response.statusText}`);
  }
  return await response.json();
}

export async function upsertDaily(
  id: string,
  data: Record<string, unknown>,
): Promise<{ status: string;
  id: string; }> {
  const response = await fetch(`/api/dailies/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to update daily: ${response.statusText}`);
  }
  return await response.json();
}

export async function deleteSingleDaily(
  id: string,
): Promise<{ status: string }> {
  return await fetch(`/api/dailies/${id}`, {
    method: "DELETE",
  }).then(res => res.json());
}

export async function fetchTasks(): Promise<Task[]> {
  return fetchJson<Task[]>("/api/tasks");
}

export async function fetchSingleTask(id: string): Promise<Task> {
  return fetchJson<Task>(`/api/tasks/${id}`);
}

export async function createTask(
  data: Record<string, unknown>,
): Promise<{ status: string;
  id: string; }> {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to create task: ${response.statusText}`);
  }
  return await response.json();
}

export async function upsertTask(
  id: string,
  data: Record<string, unknown>,
): Promise<SuccessObj> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to update task: ${response.statusText}`);
  }
  return await response.json();
}

export async function deleteSingleTask(
  id: string,
): Promise<SuccessObj> {
  return await fetch(`/api/tasks/${id}`, {
    method: "DELETE",
  }).then(res => res.json());
}

export async function duplicateDomain(
  id: string,
): Promise<{ status: string;
  id: string; }> {
  const response = await fetch(`/api/domains/${id}/duplicate`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to duplicate domain: ${response.statusText}`);
  }
  return await response.json();
}

export async function duplicateCourse(
  id: string,
): Promise<{ status: string;
  id: string; }> {
  const response = await fetch(`/api/courses/${id}/duplicate`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to duplicate course: ${response.statusText}`);
  }
  return await response.json();
}

export async function duplicateDaily(
  id: string,
): Promise<{ status: string;
  id: string; }> {
  const response = await fetch(`/api/dailies/${id}/duplicate`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to duplicate daily: ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchRadar(domainId: string): Promise<Radar> {
  const response = await fetch(`/api/domains/${domainId}/radar`);
  if (!response.ok) {
    throw new Error(`Failed to load radar: ${response.statusText}`);
  }
  return await response.json();
}

interface RadarConfigPayload {
  quadrants: { id?: string;
    name: string;
    position: number; }[];
  rings: { id?: string;
    name: string;
    position: number; }[];
}

export async function upsertRadarConfig(
  domainId: string,
  data: RadarConfigPayload,
): Promise<SuccessObj> {
  const response = await fetch(`/api/domains/${domainId}/radar`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to save radar config: ${response.statusText}`);
  }
  return await response.json();
}

interface BlipPayload {
  topicId: string;
  description?: string | null;
  quadrantId: string;
  ringId: string;
}

export async function createRadarBlip(
  domainId: string,
  data: BlipPayload,
): Promise<{ status: string;
  id: string; }> {
  const response = await fetch(`/api/domains/${domainId}/radar/blips`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to create blip: ${response.statusText}`);
  }
  return await response.json();
}

export async function upsertRadarBlip(
  domainId: string,
  blipId: string,
  data: BlipPayload,
): Promise<SuccessObj> {
  const response = await fetch(
    `/api/domains/${domainId}/radar/blips/${blipId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to update blip: ${response.statusText}`);
  }
  return await response.json();
}

export async function deleteRadarBlip(
  domainId: string,
  blipId: string,
): Promise<SuccessObj> {
  const response = await fetch(
    `/api/domains/${domainId}/radar/blips/${blipId}`,
    {
      method: "DELETE",
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to delete blip: ${response.statusText}`);
  }
  return await response.json();
}

export interface BulkBlipEntry {
  topicId?: string | null;
  newTopicName?: string | null;
  description?: string | null;
  quadrantId: string;
  ringId: string;
}

export async function bulkCreateRadarBlips(
  domainId: string,
  data: { blips: BulkBlipEntry[] },
): Promise<{ status: string;
  count: number;
  ids: string[];
  skippedDuplicates?: number; }> {
  const response = await fetch(
    `/api/domains/${domainId}/radar/blips/bulk`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to bulk-create blips: ${response.statusText}`);
  }
  return await response.json();
}
