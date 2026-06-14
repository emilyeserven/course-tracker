// Every fetch() here targets a relative same-origin /api/<endpoint> path built
// from literal strings (see createEntityClient); the URL is never
// attacker-controlled, so the SSRF candidates fallow flags are not exploitable.
// fallow-ignore-file security-sink
export interface SuccessObj {
  status: string;
}

export interface CreateResponse {
  status: string;
  id: string;
}

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Request to ${url} failed (${response.status} ${response.statusText})`,
    );
  }
  return await response.json();
}

export async function postJson<T>(
  url: string,
  data?: object,
  errorLabel?: string,
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    ...(data === undefined
      ? {}
      : {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `${errorLabel ?? `POST ${url}`} failed (${response.status} ${response.statusText})${body ? `: ${body}` : ""}`,
    );
  }
  return await response.json();
}

export async function putJson<T>(
  url: string,
  data: object,
  errorLabel?: string,
): Promise<T> {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `${errorLabel ?? `PUT ${url}`} failed (${response.status} ${response.statusText})${body ? `: ${body}` : ""}`,
    );
  }
  return await response.json();
}

export async function deleteJson<T>(url: string, errorLabel?: string): Promise<T> {
  const response = await fetch(url, {
    method: "DELETE",
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let serverMessage: string | undefined;
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed.message === "string") {
          serverMessage = parsed.message;
        }
      }
      catch {
        serverMessage = text;
      }
    }
    throw new Error(
      serverMessage
      ?? `${errorLabel ?? `DELETE ${url}`} failed (${response.status} ${response.statusText})`,
    );
  }
  return await response.json();
}

export interface EntityClient<TEntity, TList> {
  list: () => Promise<TList>;
  get: (id: string) => Promise<TEntity>;
  create: (data: Record<string, unknown>) => Promise<CreateResponse>;
  upsert: (id: string, data: Record<string, unknown>) => Promise<SuccessObj>;
  delete: (id: string) => Promise<SuccessObj>;
  duplicate: (id: string) => Promise<CreateResponse>;
}

export function createEntityClient<TEntity, TList = TEntity[]>(
  endpoint: string,
  label: string,
): EntityClient<TEntity, TList> {
  const base = `/api/${endpoint}`;
  return {
    list: () => fetchJson<TList>(base),
    get: id => fetchJson<TEntity>(`${base}/${id}`),
    create: data =>
      postJson<CreateResponse>(base, data, `Failed to create ${label}`),
    upsert: (id, data) =>
      putJson<SuccessObj>(`${base}/${id}`, data, `Failed to update ${label}`),
    delete: id =>
      deleteJson<SuccessObj>(`${base}/${id}`, `Failed to delete ${label}`),
    duplicate: id =>
      postJson<CreateResponse>(
        `${base}/${id}/duplicate`,
        undefined,
        `Failed to duplicate ${label}`,
      ),
  };
}
