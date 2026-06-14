import type { Module } from "@emstack/types";

import { act, renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { useModuleBulkEditDrafts } from "./useModuleBulkEditDrafts";

import { makeModule } from "@/test-utils/resourceModulesFixtures";

// The hook re-seeds whenever the `modules` array reference changes (production
// passes a `useMemo`-stabilised array). Each test therefore builds its module
// list once and passes that stable reference to `renderHook`.
function twoModules(): Module[] {
  return [
    makeModule({
      id: "m1",
      name: "One",
      status: "unstarted",
    }),
    makeModule({
      id: "m2",
      name: "Two",
      status: "in_progress",
    }),
  ];
}

describe("useModuleBulkEditDrafts", () => {
  test("seeds a draft per module with no dirty rows", () => {
    const mods = twoModules();
    const {
      result,
    } = renderHook(() => useModuleBulkEditDrafts(mods));
    expect(Object.keys(result.current.drafts)).toEqual(["m1", "m2"]);
    expect(result.current.dirtyCount).toBe(0);
    expect(result.current.changedRows()).toEqual([]);
    expect(result.current.drafts.m1.draft.name).toBe("One");
    expect(result.current.drafts.m2.status).toBe("in_progress");
  });

  test("patchDraft marks only that row dirty", () => {
    const mods = twoModules();
    const {
      result,
    } = renderHook(() => useModuleBulkEditDrafts(mods));
    act(() =>
      result.current.patchDraft("m1", {
        name: "Changed",
      }));
    expect(result.current.isRowDirty("m1")).toBe(true);
    expect(result.current.isRowDirty("m2")).toBe(false);
    expect(result.current.dirtyCount).toBe(1);
    expect(result.current.changedRows().map(r => r.draft.id)).toEqual(["m1"]);
    expect(result.current.changedRows()[0].draft.name).toBe("Changed");
  });

  test("patchRow status change marks the row dirty", () => {
    const mods = twoModules();
    const {
      result,
    } = renderHook(() => useModuleBulkEditDrafts(mods));
    act(() =>
      result.current.patchRow("m2", {
        status: "complete",
      }));
    expect(result.current.isRowDirty("m2")).toBe(true);
    expect(result.current.changedRows()[0].status).toBe("complete");
  });

  test("group reassignment marks the row dirty", () => {
    const mods = twoModules();
    const {
      result,
    } = renderHook(() => useModuleBulkEditDrafts(mods));
    act(() =>
      result.current.patchRow("m1", {
        moduleGroupId: "g9",
      }));
    expect(result.current.isRowDirty("m1")).toBe(true);
  });

  test("reordering tags is not a change", () => {
    const tagged: Module[] = [
      makeModule({
        id: "m1",
        tags: [
          {
            id: "t1",
            groupId: "g",
            name: "a",
            color: null,
            position: 0,
          },
          {
            id: "t2",
            groupId: "g",
            name: "b",
            color: null,
            position: 1,
          },
        ],
      }),
    ];
    const {
      result,
    } = renderHook(() => useModuleBulkEditDrafts(tagged));
    act(() =>
      result.current.patchDraft("m1", {
        tagIds: ["t2", "t1"],
      }));
    expect(result.current.isRowDirty("m1")).toBe(false);
    expect(result.current.dirtyCount).toBe(0);
  });

  test("a no-op length mode toggle is not a change", () => {
    const noLength: Module[] = [
      makeModule({
        id: "m1",
        length: null,
      }),
    ];
    const {
      result,
    } = renderHook(() => useModuleBulkEditDrafts(noLength));
    act(() =>
      result.current.patchDraft("m1", {
        durationMode: "bucket",
      }));
    expect(result.current.isRowDirty("m1")).toBe(false);
  });

  test("reset clears staged edits", () => {
    const mods = twoModules();
    const {
      result,
    } = renderHook(() => useModuleBulkEditDrafts(mods));
    act(() =>
      result.current.patchDraft("m1", {
        name: "Changed",
      }));
    expect(result.current.dirtyCount).toBe(1);
    act(() => result.current.reset());
    expect(result.current.dirtyCount).toBe(0);
    expect(result.current.drafts.m1.draft.name).toBe("One");
  });

  test("re-seeds when the source module list changes", () => {
    const {
      result, rerender,
    } = renderHook(
      ({
        mods,
      }: { mods: Module[] }) => useModuleBulkEditDrafts(mods),
      {
        initialProps: {
          mods: twoModules(),
        },
      },
    );
    act(() =>
      result.current.patchDraft("m1", {
        name: "Changed",
      }));
    expect(result.current.dirtyCount).toBe(1);
    // A refetch returns the saved value: dirtiness clears and the new baseline
    // reflects the persisted name.
    rerender({
      mods: [
        makeModule({
          id: "m1",
          name: "Changed",
          status: "unstarted",
        }),
        makeModule({
          id: "m2",
          name: "Two",
          status: "in_progress",
        }),
      ],
    });
    expect(result.current.dirtyCount).toBe(0);
    expect(result.current.drafts.m1.draft.name).toBe("Changed");
  });
});
