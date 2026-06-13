import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";

import root from "./root";
import getDashboardLayout from "./getDashboardLayout";
import upsertDashboardLayout from "./upsertDashboardLayout";
import deleteDashboardLayout from "./deleteDashboardLayout";
import duplicateDashboardLayout from "./duplicateDashboardLayout";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  fastify.register(root);
  fastify.register(getDashboardLayout);
  fastify.register(upsertDashboardLayout);
  fastify.register(deleteDashboardLayout);
  fastify.register(duplicateDashboardLayout);
}
