import type { Test, DbTest, Course, CourseInCourses } from "@emstack/types/src/index.js";
import type { OnboardData } from "@emstack/types/src/OnboardData";

interface SuccessObj {
  status: string;
}

export async function fetchTest(): Promise<Test> {
  return await fetch("http://localhost:3001/api").then(res => res.json());
}

export async function fetchDbTest(): Promise<DbTest[]> {
  return await fetch("http://localhost:3001/api/dbTest").then(res => res.json());
}

export async function fetchCourses(): Promise<CourseInCourses[]> {
  return await fetch("http://localhost:3001/api/courses").then(res => res.json());
}

export async function fetchSingleCourse(id: string): Promise<Course> {
  return await fetch(`http://localhost:3001/api/courses/${id}`).then(res => res.json());
}

export async function fetchSeed(): Promise<SuccessObj> {
  return await fetch("http://localhost:3001/api/seed").then(res => res.json());
}

export async function fetchClear(): Promise<SuccessObj> {
  return await fetch("http://localhost:3001/api/clearData").then(res => res.json());
}

export async function postOnboardForm(formData: OnboardData): Promise<SuccessObj> {
  return await fetch("http://localhost:3001/api/submitOnboardData", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  }).then(res => res.json());
}
