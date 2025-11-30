import type { Test, DbTest } from "@emstack/types/src/index.js";

export async function fetchTest(): Promise<Test> {
  return await fetch("http://localhost:3001/api").then(res => res.json());
}

export async function fetchDbTest(): Promise<DbTest[]> {
  return await fetch("http://localhost:3001/api/dbTest").then(res => res.json());
}
