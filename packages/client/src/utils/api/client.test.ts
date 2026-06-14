import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  createEntityClient,
  deleteJson,
  fetchJson,
  postJson,
  putJson,
} from "./client.ts";

interface FakeResponseInit {
  ok?: boolean;
  status?: number;
  statusText?: string;
  json?: unknown;
  text?: string;
}

function fakeResponse({
  ok = true,
  status = 200,
  statusText = "OK",
  json = {},
  text = "",
}: FakeResponseInit = {}): Response {
  return {
    ok,
    status,
    statusText,
    json: () => Promise.resolve(json),
    text: () => Promise.resolve(text),
  } as unknown as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchJson", () => {
  test("returns the parsed body on success", async () => {
    fetchMock.mockResolvedValue(fakeResponse({
      json: {
        a: 1,
      },
    }));
    await expect(fetchJson("/api/x")).resolves.toEqual({
      a: 1,
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/x");
  });

  test("throws with status details on a failed response", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({
        ok: false,
        status: 404,
        statusText: "Not Found",
      }),
    );
    await expect(fetchJson("/api/x")).rejects.toThrow(
      "Request to /api/x failed (404 Not Found)",
    );
  });
});

describe("postJson", () => {
  test("sends JSON headers and a serialized body when data is provided", async () => {
    fetchMock.mockResolvedValue(fakeResponse({
      json: {
        id: "1",
      },
    }));
    await postJson("/api/x", {
      name: "n",
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/x", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "n",
      }),
    });
  });

  test("omits the body when no data is provided", async () => {
    fetchMock.mockResolvedValue(fakeResponse());
    await postJson("/api/x");
    expect(fetchMock).toHaveBeenCalledWith("/api/x", {
      method: "POST",
    });
  });

  test("throws using the error label and response body on failure", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({
        ok: false,
        status: 500,
        statusText: "Server Error",
        text: "boom",
      }),
    );
    await expect(postJson("/api/x", {}, "Create failed")).rejects.toThrow(
      "Create failed failed (500 Server Error): boom",
    );
  });

  test("falls back to a default label when none is given", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({
        ok: false,
        status: 500,
        statusText: "Server Error",
      }),
    );
    await expect(postJson("/api/x", {})).rejects.toThrow(
      "POST /api/x failed (500 Server Error)",
    );
  });
});

describe("putJson", () => {
  test("sends a PUT with JSON headers and body", async () => {
    fetchMock.mockResolvedValue(fakeResponse({
      json: {
        status: "ok",
      },
    }));
    await putJson("/api/x/1", {
      name: "n",
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/x/1", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "n",
      }),
    });
  });

  test("throws with label and body on failure", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: "nope",
      }),
    );
    await expect(putJson("/api/x/1", {}, "Update failed")).rejects.toThrow(
      "Update failed failed (400 Bad Request): nope",
    );
  });
});

describe("deleteJson", () => {
  test("issues a DELETE and returns the parsed body", async () => {
    fetchMock.mockResolvedValue(fakeResponse({
      json: {
        status: "ok",
      },
    }));
    await expect(deleteJson("/api/x/1")).resolves.toEqual({
      status: "ok",
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/x/1", {
      method: "DELETE",
    });
  });

  test("surfaces a JSON server message on failure", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({
        ok: false,
        status: 409,
        statusText: "Conflict",
        text: JSON.stringify({
          message: "still in use",
        }),
      }),
    );
    await expect(deleteJson("/api/x/1")).rejects.toThrow("still in use");
  });

  test("uses raw text when the error body is not JSON", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({
        ok: false,
        status: 500,
        statusText: "Server Error",
        text: "plain error",
      }),
    );
    await expect(deleteJson("/api/x/1")).rejects.toThrow("plain error");
  });

  test("falls back to the label when there is no error body", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({
        ok: false,
        status: 500,
        statusText: "Server Error",
      }),
    );
    await expect(deleteJson("/api/x/1", "Delete failed")).rejects.toThrow(
      "Delete failed failed (500 Server Error)",
    );
  });
});

describe("createEntityClient", () => {
  const client = createEntityClient("widgets", "widget");

  test("list and get hit the right URLs", async () => {
    fetchMock.mockResolvedValue(fakeResponse({
      json: [],
    }));
    await client.list();
    expect(fetchMock).toHaveBeenLastCalledWith("/api/widgets");

    await client.get("7");
    expect(fetchMock).toHaveBeenLastCalledWith("/api/widgets/7");
  });

  test("create posts to the base endpoint", async () => {
    fetchMock.mockResolvedValue(fakeResponse({
      json: {
        id: "1",
      },
    }));
    await client.create({
      name: "n",
    });
    expect(fetchMock).toHaveBeenLastCalledWith("/api/widgets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "n",
      }),
    });
  });

  test("upsert puts to the id endpoint", async () => {
    fetchMock.mockResolvedValue(fakeResponse({
      json: {
        status: "ok",
      },
    }));
    await client.upsert("7", {
      name: "n",
    });
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/widgets/7",
      expect.objectContaining({
        method: "PUT",
      }),
    );
  });

  test("delete removes the id endpoint", async () => {
    fetchMock.mockResolvedValue(fakeResponse({
      json: {
        status: "ok",
      },
    }));
    await client.delete("7");
    expect(fetchMock).toHaveBeenLastCalledWith("/api/widgets/7", {
      method: "DELETE",
    });
  });

  test("duplicate posts to the duplicate sub-endpoint with no body", async () => {
    fetchMock.mockResolvedValue(fakeResponse({
      json: {
        id: "2",
      },
    }));
    await client.duplicate("7");
    expect(fetchMock).toHaveBeenLastCalledWith("/api/widgets/7/duplicate", {
      method: "POST",
    });
  });
});
