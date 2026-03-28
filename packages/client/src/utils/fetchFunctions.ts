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
