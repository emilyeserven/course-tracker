import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import {
  createOAuthState,
  getAuthUrl,
  googleOAuthConfigured,
} from "@/services/googleCalendar";
import { sendBadRequest } from "@/utils/errors";

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  // Kick off the OAuth flow: a full-page redirect to Google's consent screen.
  // Hit directly by the browser (window.location), not via fetch, so it returns
  // a 302 rather than JSON.
  fastify.get("/connect", async (request, reply) => {
    if (!googleOAuthConfigured()) {
      return sendBadRequest(
        reply,
        "Google OAuth is not configured on the server.",
      );
    }
    const state = createOAuthState();
    return reply.redirect(getAuthUrl(state));
  });
}
