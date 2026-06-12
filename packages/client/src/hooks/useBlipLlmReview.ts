import type {
  EditDraft,
  Resolution,
  ResolvedLlmEntry,
} from "@/components/radar/blipLlmReview";
import type { RadarQuadrant, RadarRing } from "@emstack/types";

import { useMemo, useState } from "react";

import { computeProblems } from "@/components/radar/blipLlmReview";

interface UseBlipLlmReviewArgs {
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  excludedNamesLower: Set<string>;
}

export function useBlipLlmReview({
  quadrants,
  rings,
  excludedNamesLower,
}: UseBlipLlmReviewArgs) {
  const [resolved, setResolved] = useState<ResolvedLlmEntry[] | null>(null);

  function updateEntry(idx: number, patch: Partial<ResolvedLlmEntry>) {
    setResolved((prev) => {
      if (!prev) {
        return prev;
      }
      return prev.map((entry, i) => {
        if (i !== idx) {
          return entry;
        }
        const next: ResolvedLlmEntry = {
          ...entry,
          ...patch,
        };
        return {
          ...next,
          problems: computeProblems(next, excludedNamesLower),
        };
      });
    });
  }

  function startEdit(idx: number) {
    setResolved((prev) => {
      if (!prev) {
        return prev;
      }
      return prev.map((entry, i) => {
        if (i !== idx) {
          return entry;
        }
        const draft: EditDraft = {
          description: entry.description ?? "",
          radarNote: entry.radarNote ?? "",
          quadrantId: entry.quadrantId ?? "",
          ringId: entry.ringId ?? "",
        };
        return {
          ...entry,
          editing: true,
          editDraft: draft,
        };
      });
    });
  }

  function commitEdit(idx: number) {
    setResolved((prev) => {
      if (!prev) {
        return prev;
      }
      return prev.map((entry, i) => {
        if (i !== idx || !entry.editDraft) {
          return entry;
        }
        const draft = entry.editDraft;
        const next: ResolvedLlmEntry = {
          ...entry,
          description: draft.description.trim() ? draft.description.trim() : null,
          radarNote: draft.radarNote.trim() ? draft.radarNote.trim() : null,
          quadrantId: draft.quadrantId || null,
          ringId: draft.ringId || null,
          editing: false,
          editDraft: null,
        };
        return {
          ...next,
          problems: computeProblems(next, excludedNamesLower),
        };
      });
    });
  }

  function cancelEdit(idx: number) {
    updateEntry(idx, {
      editing: false,
      editDraft: null,
    });
  }

  function updateDraft(idx: number, patch: Partial<EditDraft>) {
    setResolved((prev) => {
      if (!prev) {
        return prev;
      }
      return prev.map((entry, i) => {
        if (i !== idx || !entry.editDraft) {
          return entry;
        }
        return {
          ...entry,
          editDraft: {
            ...entry.editDraft,
            ...patch,
          },
        };
      });
    });
  }

  function setRowSelected(idx: number, selected: boolean) {
    setResolved((prev) => {
      if (!prev) {
        return prev;
      }
      return prev.map((entry, i) =>
        i === idx
          ? {
            ...entry,
            selected,
          }
          : entry);
    });
  }

  function setAllSelected(selected: boolean) {
    setResolved((prev) => {
      if (!prev) {
        return prev;
      }
      return prev.map(entry => ({
        ...entry,
        selected,
      }));
    });
  }

  // Apply a placement field (slice or ring) to every selected, resolvable
  // entry once a matching option is found.
  function bulkApplyPlacement(
    match: { id: string;
      name: string; } | undefined,
    toFields: (match: { id: string;
      name: string; }) => Partial<ResolvedLlmEntry>,
  ) {
    setResolved((prev) => {
      if (!prev) {
        return prev;
      }
      if (!match) {
        return prev;
      }
      return prev.map((entry) => {
        if (!entry.selected) {
          return entry;
        }
        if (entry.resolution === "skip" || entry.resolution === "removeBlip") {
          return entry;
        }
        const next: ResolvedLlmEntry = {
          ...entry,
          ...toFields(match),
        };
        return {
          ...next,
          problems: computeProblems(next, excludedNamesLower),
        };
      });
    });
  }

  function bulkSetQuadrant(quadrantId: string) {
    bulkApplyPlacement(
      quadrants.find(q => q.id === quadrantId),
      match => ({
        quadrantId: match.id,
        quadrantInput: match.name,
      }),
    );
  }

  function bulkSetRing(ringId: string) {
    bulkApplyPlacement(
      rings.find(r => r.id === ringId),
      match => ({
        ringId: match.id,
        ringInput: match.name,
      }),
    );
  }

  function bulkSetResolution(resolution: Resolution) {
    setResolved((prev) => {
      if (!prev) {
        return prev;
      }
      return prev.map((entry) => {
        if (!entry.selected) {
          return entry;
        }
        const conflicts = entry.existingBlipId !== null;
        // Skip is always valid; others depend on whether the row already has
        // an existing blip.
        if (resolution !== "skip") {
          if (resolution === "create" && conflicts) {
            return entry;
          }
          if (
            (resolution === "overwriteAll"
              || resolution === "updateBlip"
              || resolution === "removeBlip")
            && !conflicts
          ) {
            return entry;
          }
        }
        const next: ResolvedLlmEntry = {
          ...entry,
          resolution,
        };
        return {
          ...next,
          problems: computeProblems(next, excludedNamesLower),
        };
      });
    });
  }

  function bulkClearDescriptions() {
    setResolved((prev) => {
      if (!prev) {
        return prev;
      }
      return prev.map(entry =>
        entry.selected
          ? {
            ...entry,
            description: null,
          }
          : entry);
    });
  }

  function bulkClearRadarNotes() {
    setResolved((prev) => {
      if (!prev) {
        return prev;
      }
      return prev.map(entry =>
        entry.selected
          ? {
            ...entry,
            radarNote: null,
          }
          : entry);
    });
  }

  const counts = useMemo(() => {
    const c = {
      create: 0,
      overwriteAll: 0,
      updateBlip: 0,
      removeBlip: 0,
      skip: 0,
      problem: 0,
      newTopic: 0,
    };
    if (!resolved) {
      return c;
    }
    for (const r of resolved) {
      if (r.resolution === "skip") {
        c.skip += 1;
        continue;
      }
      if (r.problems.length > 0) {
        c.problem += 1;
        continue;
      }
      if (r.willCreateTopic && r.resolution === "create") {
        c.newTopic += 1;
      }
      c[r.resolution] += 1;
    }
    return c;
  }, [resolved]);

  return {
    resolved,
    setResolved,
    updateEntry,
    startEdit,
    commitEdit,
    cancelEdit,
    updateDraft,
    setRowSelected,
    setAllSelected,
    bulkSetQuadrant,
    bulkSetRing,
    bulkSetResolution,
    bulkClearDescriptions,
    bulkClearRadarNotes,
    counts,
  };
}
