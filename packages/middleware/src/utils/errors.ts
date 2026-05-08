import { FastifyReply } from "fastify";

export function sendNotFound(reply: FastifyReply, resource: string) {
  return reply.status(404).send({
    status: "error",
    message: `${resource} not found`,
  });
}

export function sendBadRequest(reply: FastifyReply, message: string) {
  return reply.status(400).send({
    status: "error",
    message,
  });
}
