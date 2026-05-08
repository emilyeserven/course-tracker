import type { LearningLogEntry } from "@emstack/types/src";

import { useMemo, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ExternalLinkIcon,
  Loader2,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { toast } from "sonner";

import { getDailyStatusOption } from "@/components/dailies/dailyStatusMeta";
import { Input } from "@/components/forms/input";
import { Textarea } from "@/components/forms/textarea";
import { Button } from "@/components/ui/button";
import {
  createDomainLearningLogEntry,
  deleteDomainLearningLogEntry,
  isHttpUrl,
  updateDomainLearningLogEntry,
} from "@/utils";

interface DomainLearningLogProps {
  domainId: string;
  entries: LearningLogEntry[];
}

interface DraftEntry {
  date: string;
  description: string;
  link: string;
}

const EMPTY_DRAFT: DraftEntry = {
  date: "",
  description: "",
  link: "",
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function entryKey(entry: LearningLogEntry): string {
  return `${entry.source}:${entry.id}`;
}

function formatDate(date: string): string {
  if (!date) {
    return "(no date)";
  }
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DomainLearningLog({
  domainId, entries,
}: DomainLearningLogProps) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<DraftEntry | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<DraftEntry>(EMPTY_DRAFT);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isSavingNew, setIsSavingNew] = useState(false);

  const sortedEntries = useMemo(() => entries, [entries]);

  async function invalidate() {
    await queryClient.invalidateQueries({
      queryKey: ["domain", domainId],
    });
  }

  function startAdd() {
    setDraft({
      ...EMPTY_DRAFT,
      date: todayKey(),
    });
  }

  function cancelAdd() {
    setDraft(null);
  }

  async function saveNew() {
    if (!draft) {
      return;
    }
    if (!draft.date.trim() || !draft.description.trim()) {
      toast.error("Date and description are required.");
      return;
    }
    if (draft.link.trim() && !isHttpUrl(draft.link.trim())) {
      toast.error("Link must be a valid URL (http or https).");
      return;
    }
    setIsSavingNew(true);
    try {
      await createDomainLearningLogEntry(domainId, {
        date: draft.date,
        description: draft.description.trim(),
        link: draft.link.trim() || null,
      });
      await invalidate();
      setDraft(null);
      toast.success("Entry added.");
    }
    catch {
      toast.error("Failed to add entry.");
    }
    finally {
      setIsSavingNew(false);
    }
  }

  function startEdit(entry: LearningLogEntry) {
    setEditingId(entry.id);
    setEditDraft({
      date: entry.date,
      description: entry.description,
      link: entry.link ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(EMPTY_DRAFT);
  }

  async function saveEdit(entryId: string) {
    if (!editDraft.date.trim() || !editDraft.description.trim()) {
      toast.error("Date and description are required.");
      return;
    }
    if (editDraft.link.trim() && !isHttpUrl(editDraft.link.trim())) {
      toast.error("Link must be a valid URL (http or https).");
      return;
    }
    setBusyId(entryId);
    try {
      await updateDomainLearningLogEntry(domainId, entryId, {
        date: editDraft.date,
        description: editDraft.description.trim(),
        link: editDraft.link.trim() || null,
      });
      await invalidate();
      cancelEdit();
      toast.success("Entry updated.");
    }
    catch {
      toast.error("Failed to update entry.");
    }
    finally {
      setBusyId(null);
    }
  }

  async function removeEntry(entryId: string) {
    setBusyId(entryId);
    try {
      await deleteDomainLearningLogEntry(domainId, entryId);
      await invalidate();
      toast.success("Entry removed.");
    }
    catch {
      toast.error("Failed to delete entry.");
    }
    finally {
      setBusyId(null);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-row items-center justify-between gap-2">
        <h2 className="text-2xl">Learning Log</h2>
        {!draft && (
          <Button
            type="button"
            variant="outline"
            onClick={startAdd}
          >
            <PlusIcon />
            {" "}
            Add Entry
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Auto-imports activity from your dailies for courses, topics, or tasks
        linked to this domain. You can also add manual notes with a date,
        description, and optional link.
      </p>

      {draft && (
        <div className="flex flex-col gap-2 rounded-sm border p-3">
          <div
            className={`
              grid grid-cols-1 gap-2
              sm:grid-cols-[180px_minmax(0,1fr)]
            `}
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase">
                Date
              </label>
              <Input
                type="date"
                value={draft.date}
                onChange={e =>
                  setDraft(prev =>
                    prev
                      ? {
                        ...prev,
                        date: e.target.value,
                      }
                      : prev)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground uppercase">
                Link (optional)
              </label>
              <Input
                type="url"
                value={draft.link}
                onChange={e =>
                  setDraft(prev =>
                    prev
                      ? {
                        ...prev,
                        link: e.target.value,
                      }
                      : prev)}
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground uppercase">
              Description
            </label>
            <Textarea
              value={draft.description}
              onChange={e =>
                setDraft(prev =>
                  prev
                    ? {
                      ...prev,
                      description: e.target.value,
                    }
                    : prev)}
              placeholder="What did you learn or do?"
            />
          </div>
          <div className="flex flex-row gap-2">
            <Button
              type="button"
              onClick={saveNew}
              disabled={isSavingNew}
            >
              {isSavingNew && <Loader2 className="animate-spin" />}
              Save Entry
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={cancelAdd}
              disabled={isSavingNew}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {sortedEntries.length === 0
        ? (
          <p className="text-sm text-muted-foreground italic">
            No learning log entries yet.
          </p>
        )
        : (
          <ul className="flex flex-col gap-2">
            {sortedEntries.map((entry) => {
              const key = entryKey(entry);
              const isManual = entry.source === "manual";
              const isEditing = isManual && editingId === entry.id;
              const statusOption = entry.status
                ? getDailyStatusOption(entry.status)
                : null;
              return (
                <li
                  key={key}
                  className={`
                    flex flex-col gap-2 rounded-sm border p-3
                    ${isManual
                  ? "bg-white"
                  : "bg-muted/30"}
                  `}
                >
                  {isEditing
                    ? (
                      <div className="flex flex-col gap-2">
                        <div
                          className={`
                            grid grid-cols-1 gap-2
                            sm:grid-cols-[180px_minmax(0,1fr)]
                          `}
                        >
                          <div className="flex flex-col gap-1">
                            <label
                              className={`
                                text-xs text-muted-foreground uppercase
                              `}
                            >
                              Date
                            </label>
                            <Input
                              type="date"
                              value={editDraft.date}
                              onChange={e =>
                                setEditDraft(prev => ({
                                  ...prev,
                                  date: e.target.value,
                                }))}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label
                              className={`
                                text-xs text-muted-foreground uppercase
                              `}
                            >
                              Link (optional)
                            </label>
                            <Input
                              type="url"
                              value={editDraft.link}
                              onChange={e =>
                                setEditDraft(prev => ({
                                  ...prev,
                                  link: e.target.value,
                                }))}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label
                            className="text-xs text-muted-foreground uppercase"
                          >
                            Description
                          </label>
                          <Textarea
                            value={editDraft.description}
                            onChange={e =>
                              setEditDraft(prev => ({
                                ...prev,
                                description: e.target.value,
                              }))}
                          />
                        </div>
                        <div className="flex flex-row gap-2">
                          <Button
                            type="button"
                            onClick={() => saveEdit(entry.id)}
                            disabled={busyId === entry.id}
                          >
                            {busyId === entry.id && (
                              <Loader2 className="animate-spin" />
                            )}
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={cancelEdit}
                            disabled={busyId === entry.id}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )
                    : (
                      <div className="flex flex-row items-start gap-3">
                        <div
                          className={`
                            flex w-28 shrink-0 flex-col gap-1 text-xs
                            text-muted-foreground
                          `}
                        >
                          <div className="font-mono">
                            {formatDate(entry.date)}
                          </div>
                          <div
                            className={`
                              rounded-sm px-1.5 py-0.5 text-center font-medium
                              ${isManual
                        ? "bg-blue-100 text-blue-800"
                        : "bg-emerald-100 text-emerald-800"}
                            `}
                          >
                            {isManual ? "Manual" : "Daily"}
                          </div>
                          {statusOption && (
                            <div
                              className={`
                                rounded-sm border px-1.5 py-0.5 text-center
                                ${statusOption.pillClass}
                              `}
                            >
                              {statusOption.label}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-1">
                          <p className="text-sm">{entry.description}</p>
                          <div
                            className={`
                              flex flex-row flex-wrap gap-x-3 gap-y-1 text-xs
                              text-muted-foreground
                            `}
                          >
                            {entry.link && (
                              <a
                                href={entry.link}
                                target="_blank"
                                rel="noreferrer"
                                className={`
                                  inline-flex items-center gap-1 text-blue-700
                                  hover:text-blue-500
                                `}
                              >
                                <ExternalLinkIcon className="size-3" />
                                {" "}
                                Link
                              </a>
                            )}
                            {entry.courseId && entry.courseName && (
                              <Link
                                to="/courses/$id"
                                params={{
                                  id: entry.courseId,
                                }}
                                className={`
                                  text-blue-700
                                  hover:text-blue-500
                                `}
                              >
                                Course:
                                {" "}
                                {entry.courseName}
                              </Link>
                            )}
                            {entry.taskId && entry.taskName && (
                              <Link
                                to="/tasks/$id"
                                params={{
                                  id: entry.taskId,
                                }}
                                className={`
                                  text-blue-700
                                  hover:text-blue-500
                                `}
                              >
                                Task:
                                {" "}
                                {entry.taskName}
                              </Link>
                            )}
                            {entry.dailyId && entry.dailyName && (
                              <Link
                                to="/dailies/$id"
                                params={{
                                  id: entry.dailyId,
                                }}
                                className={`
                                  text-blue-700
                                  hover:text-blue-500
                                `}
                              >
                                Daily:
                                {" "}
                                {entry.dailyName}
                              </Link>
                            )}
                          </div>
                        </div>
                        {isManual && (
                          <div className="flex flex-row gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => startEdit(entry)}
                              disabled={busyId === entry.id}
                              aria-label="Edit entry"
                            >
                              <PencilIcon />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeEntry(entry.id)}
                              disabled={busyId === entry.id}
                              aria-label="Delete entry"
                            >
                              {busyId === entry.id
                                ? (
                                  <Loader2 className="animate-spin" />
                                )
                                : (
                                  <TrashIcon />
                                )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                </li>
              );
            })}
          </ul>
        )}
      {draft === null && sortedEntries.length === 0 && (
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={startAdd}
          >
            <PlusIcon />
            {" "}
            Add First Entry
          </Button>
        </div>
      )}
    </section>
  );
}
