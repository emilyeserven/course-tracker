import type { SuccessObj } from "./client";
import type { OnboardData } from "@emstack/types";

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
