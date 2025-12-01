import type { Test, DbTest, Course, CourseInCourses } from "@emstack/types/src/index.js";

export async function fetchTest(): Promise<Test> {
  return await fetch("http://localhost:3001/api").then(res => res.json());
}

export async function fetchDbTest(): Promise<DbTest[]> {
  return await fetch("http://localhost:3001/api/dbTest").then(res => res.json());
}

export async function fetchCourses(): Promise<CourseInCourses[]> {
  return await fetch("http://localhost:3001/api/courses").then(res => res.json());
}

export async function fetchSingleCourse(id: number): Promise<Course> {
  return await fetch(`http://localhost:3001/api/courses/${id}`).then(res => res.json());
}
