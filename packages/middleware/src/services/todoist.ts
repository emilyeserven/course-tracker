import type { TodoistTask } from "@emstack/types";
import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { buildCloseTaskUrl } from "./todoistUrls.ts";

// Todoist API v1 (unified REST). The dedicated filter endpoint runs a Todoist
// filter query server-side and returns matching active tasks, paginated.
const TODOIST_FILTER_URL = "https://api.todoist.com/api/v1/tasks/filter";

// Project list, used to resolve a task's project_id to a human-readable name.
const TODOIST_PROJECTS_URL = "https://api.todoist.com/api/v1/projects";

// Deep-link base for the Todoist web app. Tasks don't carry a URL in the v1
// payload, so we build one from the task id.
const TODOIST_TASK_URL = "https://app.todoist.com/app/task";

// Create endpoint for the unified v1 REST API.
const TODOIST_CREATE_URL = "https://api.todoist.com/api/v1/tasks";

// Label stamped on tasks created from Course Tracker so the source is traceable.
// Todoist creates the label by name on first use.
const SOURCE_LABEL = "from-coursetracker";

// Filter query for the dashboard card: anything due today or already overdue.
const DUE_FILTER = "today | overdue";

// Bound pagination defensively so a huge backlog can't hang the request or
// burn through the rate limit. 200 tasks/page × 5 pages is far more than a
// dashboard card needs.
const PAGE_LIMIT = 200;
const MAX_PAGES = 5;

/** Raw shape of the fields we read off a Todoist v1 task. */
interface RawTodoistTask {
  id: string;
  content?: string | null;
  description?: string | null;
  priority?: number | null;
  project_id?: string | null;
  labels?: string[] | null;
  due?: {
    date?: string | null;
    string?: string | null;
    is_recurring?: boolean | null;
  } | null;
}

interface RawFilterResponse {
  results: RawTodoistTask[];
  next_cursor: string | null;
}

/** Raw shape of the fields we read off a Todoist v1 project. */
interface RawTodoistProject {
  id: string;
  name?: string | null;
}

interface RawProjectsResponse {
  results: RawTodoistProject[];
  next_cursor: string | null;
}

/** Error carrying an HTTP status so the route can map it to a friendly reply. */
export class TodoistError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "TodoistError";
    this.statusCode = statusCode;
  }
}

/**
 * Resolve the Todoist token: the DB-stored key (set via Settings) takes
 * precedence, falling back to the TODOIST_API_KEY env var for deployments that
 * prefer to inject it. Returns null when neither is set.
 */
export async function getTodoistToken(): Promise<string | null> {
  const [row] = await db.select().from(appSettings).limit(1);
  const stored = row?.todoistApiKey?.trim();
  if (stored) return stored;
  const fromEnv = process.env.TODOIST_API_KEY?.trim();
  return fromEnv ? fromEnv : null;
}

/** Today's calendar date as YYYY-MM-DD in the server's local timezone. */
function todayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mapTask(
  raw: RawTodoistTask,
  projectMap: Map<string, string>,
): TodoistTask {
  // due.date can be a plain date ("2026-06-13") or a full datetime
  // ("2026-06-13T09:00:00Z"); the leading 10 chars are the calendar date.
  const dueDate = raw.due?.date ? raw.due.date.slice(0, 10) : null;
  return {
    id: raw.id,
    content: raw.content?.trim() || "Untitled task",
    url: `${TODOIST_TASK_URL}/${raw.id}`,
    priority: raw.priority ?? 1,
    due: raw.due?.string ?? null,
    dueDate,
    isRecurring: raw.due?.is_recurring ?? false,
    project: raw.project_id ? projectMap.get(raw.project_id) ?? null : null,
    labels: raw.labels ?? [],
    description: raw.description?.trim() ?? "",
  };
}

/**
 * Translate a fetch failure / non-OK response into a friendly TodoistError.
 * Shared by every Todoist call so they map statuses consistently.
 */
function assertTodoistOk(response: Response): void {
  if (response.status === 401 || response.status === 403) {
    throw new TodoistError("Todoist rejected the API key.", 401);
  }
  if (response.status === 429) {
    throw new TodoistError("Todoist rate limit reached — try again shortly.", 429);
  }
  if (!response.ok) {
    throw new TodoistError(`Todoist request failed (${response.status}).`, 502);
  }
}

async function fetchFilteredTasks(token: string): Promise<RawTodoistTask[]> {
  const collected: RawTodoistTask[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    const params = new URLSearchParams({
      query: DUE_FILTER,
      limit: String(PAGE_LIMIT),
    });
    if (cursor) params.set("cursor", cursor);

    let response: Response;
    try {
      response = await fetch(`${TODOIST_FILTER_URL}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    catch {
      throw new TodoistError("Could not reach Todoist.", 502);
    }

    assertTodoistOk(response);

    const body = (await response.json()) as RawFilterResponse;
    collected.push(...(body.results ?? []));

    cursor = body.next_cursor;
    if (!cursor) break;
  }

  return collected;
}

/**
 * Build an id → name map of the user's Todoist projects so task rows can show a
 * readable project name (the filter endpoint only returns project_id).
 */
async function fetchProjectMap(token: string): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  let cursor: string | null = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    const params = new URLSearchParams({
      limit: String(PAGE_LIMIT),
    });
    if (cursor) params.set("cursor", cursor);

    let response: Response;
    try {
      response = await fetch(`${TODOIST_PROJECTS_URL}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    catch {
      throw new TodoistError("Could not reach Todoist.", 502);
    }

    assertTodoistOk(response);

    const body = (await response.json()) as RawProjectsResponse;
    for (const project of body.results ?? []) {
      if (project.name) map.set(project.id, project.name);
    }

    cursor = body.next_cursor;
    if (!cursor) break;
  }

  return map;
}

/**
 * Close (complete) a Todoist task. Returns 204 No Content on success, so the
 * body is never parsed.
 */
export async function closeTodoistTask(
  token: string,
  id: string,
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(buildCloseTaskUrl(id), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  catch {
    throw new TodoistError("Could not reach Todoist.", 502);
  }

  if (response.status === 404) {
    throw new TodoistError("Todoist task not found.", 404);
  }
  assertTodoistOk(response);
}

export interface TodoistTasksData {
  overdue: TodoistTask[];
  today: TodoistTask[];
}

/**
 * Fetch the user's active tasks due today or overdue and split them by whether
 * their due date falls before today (overdue) or on today. Tasks with a higher
 * Todoist priority surface first within the "today" list; overdue tasks are
 * ordered oldest-first.
 */
export async function fetchTodayAndOverdue(
  token: string,
): Promise<TodoistTasksData> {
  const today = todayDateString();
  const [raw, projectMap] = await Promise.all([
    fetchFilteredTasks(token),
    fetchProjectMap(token),
  ]);

  const overdue: TodoistTask[] = [];
  const dueToday: TodoistTask[] = [];
  for (const item of raw) {
    const task = mapTask(item, projectMap);
    if (task.dueDate && task.dueDate < today) {
      overdue.push(task);
    }
    else {
      dueToday.push(task);
    }
  }

  overdue.sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
  dueToday.sort((a, b) => b.priority - a.priority);

  return {
    overdue,
    today: dueToday,
  };
}

/**
 * Create a Todoist task, labeled with the source label. `content` is the task
 * title; `description` is the optional note body. Returns the new task id.
 */
export async function createTodoistTask(
  token: string,
  content: string,
  description?: string,
): Promise<{ id: string }> {
  let response: Response;
  try {
    response = await fetch(TODOIST_CREATE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        labels: [SOURCE_LABEL],
        ...(description
          ? {
            description,
          }
          : {}),
      }),
    });
  }
  catch {
    throw new TodoistError("Could not reach Todoist.", 502);
  }

  assertTodoistOk(response);

  const body = (await response.json()) as {
    id?: string;
  };
  return {
    id: body.id ?? "",
  };
}
