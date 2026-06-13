import { dashboardLayouts } from "@/db/schema";
import { createDeleteHandler } from "@/utils/createDeleteHandler";

export default createDeleteHandler({
  description: "Delete a dashboard layout by ID",
  table: dashboardLayouts,
  idColumn: dashboardLayouts.id,
});
