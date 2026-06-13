import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { disconnectGoogle } from "@/services/googleCalendar";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  // Forget the stored tokens and calendar selection.
  fastify.post("/disconnect", async () => {
    await disconnectGoogle();
    return {
      status: "ok",
    };
  });
}
