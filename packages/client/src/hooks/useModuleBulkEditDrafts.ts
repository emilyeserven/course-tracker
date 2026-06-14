import type { ModuleDraft } from "@/components/resources/moduleDrafts";
import type { Module, ModuleStatus } from "@emstack/types";

import { useCallback, useEffect, useMemo, useState } from "react";

import { draftToLength, moduleToDraft } from "@/components/resources/moduleDrafts";

/**
 * One editable row of the bulk-edit table. `ModuleDraft` carries the form-shaped
 * scalar fields (name, url, pages, length, levels, tags); `status` and
 * `moduleGroupId` live outside the draft because they ride alongside it into the
 * upsert mutation, so they are tracked here rather than baked into `ModuleDraft`.
 */
export interface ModuleRowDraft {
  draft: ModuleDraft;
  status: ModuleStatus;
  moduleGroupId: string | null;
}

export function moduleToRowDraft(m: Module): ModuleRowDraft {
  return {
    draft: moduleToDraft(m),
    status: m.status,
    moduleGroupId: m.moduleGroupId ?? null,
  };
}

function seedDrafts(modules: Module[]): Record<string, ModuleRowDraft> {
  const out: Record<string, ModuleRowDraft> = {};
  for (const m of modules) out[m.id] = moduleToRowDraft(m);
  return out;
}

function sameTagSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every(id => set.has(id));
}

/**
 * Whether two row drafts would persist identically. Length is compared by its
 * persisted value (via `draftToLength`) so a no-op minutes/range mode toggle
 * doesn't read as a change, and tags are compared order-insensitively.
 */
export function rowDraftsEqual(a: ModuleRowDraft, b: ModuleRowDraft): boolean {
  if (a.status !== b.status) return false;
  if (a.moduleGroupId !== b.moduleGroupId) return false;
  const da = a.draft;
  const db = b.draft;
  return (
    da.name === db.name
    && da.description === db.description
    && da.url === db.url
    && da.pageStart === db.pageStart
    && da.pageEnd === db.pageEnd
    && draftToLength(da) === draftToLength(db)
    && da.easeOfStarting === db.easeOfStarting
    && da.timeNeeded === db.timeNeeded
    && da.interactivity === db.interactivity
    && sameTagSet(da.tagIds, db.tagIds)
  );
}

/**
 * Staged per-row edit state for the module bulk-edit table. Seeds a draft for
 * every module, exposes per-field patchers, tracks which rows differ from their
 * original ("dirty"), and re-seeds whenever the source module list changes (e.g.
 * after a save + refetch). A background refetch therefore discards unsaved local
 * edits — the same trade-off the single-card editors make.
 */
export function useModuleBulkEditDrafts(modules: Module[]) {
  const [drafts, setDrafts] = useState<Record<string, ModuleRowDraft>>(() =>
    seedDrafts(modules));

  useEffect(() => {
    setDrafts(seedDrafts(modules));
  }, [modules]);

  const baselineById = useMemo(() => {
    const map = new Map<string, ModuleRowDraft>();
    for (const m of modules) map.set(m.id, moduleToRowDraft(m));
    return map;
  }, [modules]);

  const patchDraft = useCallback((id: string, patch: Partial<ModuleDraft>) => {
    setDrafts((prev) => {
      const row = prev[id];
      if (!row) return prev;
      return {
        ...prev,
        [id]: {
          ...row,
          draft: {
            ...row.draft,
            ...patch,
          },
        },
      };
    });
  }, []);

  const patchRow = useCallback(
    (
      id: string,
      patch: { status?: ModuleStatus;
        moduleGroupId?: string | null; },
    ) => {
      setDrafts((prev) => {
        const row = prev[id];
        if (!row) return prev;
        return {
          ...prev,
          [id]: {
            ...row,
            ...patch,
          },
        };
      });
    },
    [],
  );

  const isRowDirty = useCallback(
    (id: string) => {
      const cur = drafts[id];
      const base = baselineById.get(id);
      if (!cur || !base) return false;
      return !rowDraftsEqual(cur, base);
    },
    [drafts, baselineById],
  );

  const dirtyIds = useMemo(
    () => Object.keys(drafts).filter(id => isRowDirty(id)),
    [drafts, isRowDirty],
  );

  const changedRows = useCallback(
    () => dirtyIds.map(id => drafts[id]),
    [dirtyIds, drafts],
  );

  const reset = useCallback(() => setDrafts(seedDrafts(modules)), [modules]);

  return {
    drafts,
    patchDraft,
    patchRow,
    isRowDirty,
    dirtyCount: dirtyIds.length,
    changedRows,
    reset,
  };
}

export type ModuleBulkEditDrafts = ReturnType<typeof useModuleBulkEditDrafts>;
