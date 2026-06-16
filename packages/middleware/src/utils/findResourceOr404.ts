import { FastifyReply } from "fastify";
import { db } from "@/db";
import { sendNotFound } from "./errors";

// Fetch a resource by id, or send a 404 and return null. Callers must early-return
// on null — the 404 reply is already sent:
//   const resource = await findResourceOr404(reply, id);
//   if (!resource) return reply;
export async function findResourceOr404(reply: FastifyReply, id: string) {
  const resource = await db.query.resources.findFirst({
    where: (resources, {
      eq,
    }) => eq(resources.id, id),
  });

  if (!resource) {
    sendNotFound(reply, "Resource");
    return null;
  }

  return resource;
}
