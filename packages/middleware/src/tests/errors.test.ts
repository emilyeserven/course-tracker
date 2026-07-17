import type { FastifyReply } from "fastify";

import assert from "node:assert";
import { test } from "node:test";

import { sendBadRequest, sendConflict, sendNotFound } from "../utils/errors.ts";

// A minimal reply double capturing what the helpers set. The helpers only use
// status().send(), so this stub is the whole surface they touch.
function fakeReply() {
  const calls: { status?: number;
    body?: unknown; } = {};
  const reply = {
    status(code: number) {
      calls.status = code;
      return reply;
    },
    send(body: unknown) {
      calls.body = body;
      return reply;
    },
  };
  return {
    reply: reply as unknown as FastifyReply,
    calls,
  };
}

test("sendNotFound replies 404 with the resource in the message", () => {
  const {
    reply, calls,
  } = fakeReply();
  sendNotFound(reply, "Routine");
  assert.strictEqual(calls.status, 404);
  assert.deepStrictEqual(calls.body, {
    status: "error",
    message: "Routine not found",
  });
});

test("sendBadRequest replies 400 with the given message", () => {
  const {
    reply, calls,
  } = fakeReply();
  sendBadRequest(reply, "missing name");
  assert.strictEqual(calls.status, 400);
  assert.deepStrictEqual(calls.body, {
    status: "error",
    message: "missing name",
  });
});

test("sendConflict replies 409 with the given message", () => {
  const {
    reply, calls,
  } = fakeReply();
  sendConflict(reply, "already exists");
  assert.strictEqual(calls.status, 409);
  assert.deepStrictEqual(calls.body, {
    status: "error",
    message: "already exists",
  });
});
