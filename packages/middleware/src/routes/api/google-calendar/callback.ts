import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import {
  connectWithCode,
  consumeOAuthState,
} from "@/services/googleCalendar";

// Where to send the browser back to after the OAuth round trip. A path-absolute
// URL resolves against the request origin, so it works both in dev (Vite proxy
// on :5173) and prod (the gateway), without knowing the public host.
const SETTINGS_OK = "/settings?tab=connections&google=connected";
const SETTINGS_ERR = "/settings?tab=connections&google=error";

const callbackSchema = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        code: {
          type: "string",
        },
        state: {
          type: "string",
        },
        error: {
          type: "string",
        },
      },
    },
  },
} as const;

export default async function (server: FastifyInstance) {
  const fastify = server.withTypeProvider<JsonSchemaToTsProvider>();

  // Google redirects the browser here after consent. We exchange the code for
  // tokens, persist them, then bounce back to the Settings page. Errors are
  // surfaced via the ?google=error query param rather than an error page.
  fastify.get("/callback", callbackSchema, async (request, reply) => {
    const {
      code, state, error,
    } = request.query;

    if (error || !code || !consumeOAuthState(state)) {
      return reply.redirect(SETTINGS_ERR);
    }

    try {
      await connectWithCode(code);
    }
    catch {
      return reply.redirect(SETTINGS_ERR);
    }

    return reply.redirect(SETTINGS_OK);
  });
}
