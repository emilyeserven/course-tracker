import type { DashboardLayout } from "@emstack/types";

import { createEntityClient } from "./client";

const dashboardLayoutsApi = createEntityClient<DashboardLayout>(
  "dashboard-layouts",
  "dashboard layout",
);

export const fetchDashboardLayouts = dashboardLayoutsApi.list;
export const createDashboardLayout = dashboardLayoutsApi.create;
export const upsertDashboardLayout = dashboardLayoutsApi.upsert;
export const deleteSingleDashboardLayout = dashboardLayoutsApi.delete;
