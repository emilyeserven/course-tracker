import type {
  Test,
  DbTest,
  Course,
  CourseInCourses,
  TopicForTopicsPage,
  CourseProvider,
} from "@emstack/types/src/index.js";
import type { OnboardData } from "@emstack/types/src/OnboardData";
import type { Topic } from "@emstack/types/src/Topic";

interface SuccessObj {
  status: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function fetchTest(): Promise<Test> {
  return await fetch(`${API_BASE}/api`).then(res => res.json());
}

export async function fetchDbTest(): Promise<DbTest[]> {
  return await fetch(`${API_BASE}/api/dbTest`).then(res => res.json());
}

export async function fetchTopics(): Promise<TopicForTopicsPage[]> {
  return await fetch(`${API_BASE}/api/topics`).then(res => res.json());
}

export async function fetchProviders(): Promise<CourseProvider[]> {
  return await fetch(`${API_BASE}/api/providers`).then(res => res.json());
}

export async function fetchCourses(): Promise<CourseInCourses[]> {
  return await fetch(`${API_BASE}/api/courses`).then(res => res.json());
}

export async function deleteSingleCourse(id: string): Promise<Course> {
  console.log("delete single course");
  return await fetch(`${API_BASE}/api/courses/${id}`, {
    method: "DELETE",
  }).then(res => res.json());
}

export async function deleteSinglePlatform(id: string): Promise<Course> {
  console.log("delete single platform");
  return await fetch(`${API_BASE}/api/providers/${id}`, {
    method: "DELETE",
  }).then(res => res.json());
}

export async function deleteSingleTopic(id: string): Promise<Course> {
  console.log("delete single topic");
  return await fetch(`${API_BASE}/api/topics/${id}`, {
    method: "DELETE",
  }).then(res => res.json());
}

export async function fetchSingleCourse(id: string): Promise<Course> {
  return await fetch(`${API_BASE}/api/courses/${id}`).then(res => res.json());
}

export async function fetchSingleTopic(id: string): Promise<Topic> {
  return await fetch(`${API_BASE}/api/topics/${id}`).then(res => res.json());
}

export async function fetchSingleProvider(id: string): Promise<CourseProvider> {
  return await fetch(`${API_BASE}/api/providers/${id}`).then(res =>
    res.json());
}

export async function fetchSeed(): Promise<SuccessObj> {
  return await fetch(`${API_BASE}/api/seed`).then(res => res.json());
}

export async function fetchClear(): Promise<SuccessObj> {
  return await fetch(`${API_BASE}/api/clearData`).then(res => res.json());
}

export async function postOnboardForm(
  formData: OnboardData,
): Promise<SuccessObj> {
  return await fetch(`${API_BASE}/api/submitOnboardData`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  }).then(res => res.json());
}
