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

export async function fetchTest(): Promise<Test> {
  return await fetch("/api").then(res => res.json());
}

export async function fetchDbTest(): Promise<DbTest[]> {
  return await fetch("/api/dbTest").then(res => res.json());
}

export async function fetchTopics(): Promise<TopicForTopicsPage[]> {
  return await fetch("/api/topics").then(res => res.json());
}

export async function fetchProviders(): Promise<CourseProvider[]> {
  return await fetch("/api/providers").then(res => res.json());
}

export async function fetchCourses(): Promise<CourseInCourses[]> {
  return await fetch("/api/courses").then(res => res.json());
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
  return await fetch(`/api/courses/${id}`).then(res => res.json());
}

export async function fetchSingleTopic(id: string): Promise<Topic> {
  return await fetch(`/api/topics/${id}`).then(res => res.json());
}

export async function fetchSingleProvider(id: string): Promise<CourseProvider> {
  return await fetch(`/api/providers/${id}`).then(res => res.json());
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
  return await fetch("/api/domains").then(res => res.json());
}

export async function fetchSingleDomain(id: string): Promise<Domain> {
  const res = await fetch(`/api/domains/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to load domain: ${res.statusText}`);
  }
  return await res.json();
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

interface LearningLogEntryPayload {
  date: string;
  description: string;
  link?: string | null;
}

export async function createDomainLearningLogEntry(
  domainId: string,
  data: LearningLogEntryPayload,
): Promise<{ status: string;
  id: string; }> {
  const response = await fetch(
    `/api/domains/${domainId}/learning-log`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to create learning log entry: ${response.statusText}`);
  }
  return await response.json();
}

export async function updateDomainLearningLogEntry(
  domainId: string,
  entryId: string,
  data: LearningLogEntryPayload,
): Promise<SuccessObj> {
  const response = await fetch(
    `/api/domains/${domainId}/learning-log/${entryId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to update learning log entry: ${response.statusText}`);
  }
  return await response.json();
}

export async function deleteDomainLearningLogEntry(
  domainId: string,
  entryId: string,
): Promise<SuccessObj> {
  const response = await fetch(
    `/api/domains/${domainId}/learning-log/${entryId}`,
    {
      method: "DELETE",
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to delete learning log entry: ${response.statusText}`);
  }
  return await response.json();
}

export async function fetchDailies(): Promise<Daily[]> {
  return await fetch("/api/dailies").then(res => res.json());
}

export async function fetchSingleDaily(id: string): Promise<Daily> {
  return await fetch(`/api/dailies/${id}`).then(res => res.json());
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
  return await fetch("/api/tasks").then(res => res.json());
}

export async function fetchSingleTask(id: string): Promise<Task> {
  return await fetch(`/api/tasks/${id}`).then(res => res.json());
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
