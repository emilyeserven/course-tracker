import type { TopicsTableSort } from "@/components/boxes";
import type { ViewMode } from "@/components/listControls";
import type { Domain, TopicForTopicsPage } from "@emstack/types";

import { useEffect, useMemo, useState } from "react";

import { Link } from "@tanstack/react-router";
import { PlusIcon, Trash2Icon } from "lucide-react";

import { ContentBox, TopicBox, TopicsTable } from "@/components/boxes";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  ClearFiltersButton,
  FilterSelect,
  ListSearchInput,
  OnboardingEmptyState,
  ViewModeToggle,
} from "@/components/listControls";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption
  = | "alpha-asc"
    | "alpha-desc"
    | "resources-desc"
    | "tasks-desc"
    | "dailies-desc"
    | "custom";

const DEFAULT_SORT: TopicsTableSort = {
  column: "name",
  direction: "asc",
};

function sortToOption(sort: TopicsTableSort): SortOption {
  if (sort.column === "name" && sort.direction === "asc") return "alpha-asc";
  if (sort.column === "name" && sort.direction === "desc") return "alpha-desc";
  if (sort.column === "resources" && sort.direction === "desc") {
    return "resources-desc";
  }
  if (sort.column === "tasks" && sort.direction === "desc") {
    return "tasks-desc";
  }
  if (sort.column === "dailies" && sort.direction === "desc") {
    return "dailies-desc";
  }
  return "custom";
}

function optionToSort(option: SortOption): TopicsTableSort {
  switch (option) {
    case "alpha-asc":
      return {
        column: "name",
        direction: "asc",
      };
    case "alpha-desc":
      return {
        column: "name",
        direction: "desc",
      };
    case "resources-desc":
      return {
        column: "resources",
        direction: "desc",
      };
    case "tasks-desc":
      return {
        column: "tasks",
        direction: "desc",
      };
    case "dailies-desc":
      return {
        column: "dailies",
        direction: "desc",
      };
    case "custom":
      return DEFAULT_SORT;
  }
}

const VIEW_MODE_STORAGE_KEY = "topics:viewMode";

function getInitialViewMode(): ViewMode {
  if (typeof window === "undefined") return "grid";
  const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
  return stored === "table" ? "table" : "grid";
}

function firstDomainTitle(topic: TopicForTopicsPage): string {
  const first = topic.domains?.find(d => d.id !== undefined);
  return first?.title ?? "";
}

function sortTopics(
  topics: TopicForTopicsPage[],
  sort: TopicsTableSort,
): TopicForTopicsPage[] {
  const dir = sort.direction === "asc" ? 1 : -1;
  return [...topics].sort((a, b) => {
    switch (sort.column) {
      case "name":
        return a.name.localeCompare(b.name) * dir;
      case "domains": {
        const cmp = firstDomainTitle(a).localeCompare(firstDomainTitle(b));
        return cmp !== 0 ? cmp * dir : a.name.localeCompare(b.name);
      }
      case "resources":
        return (
          ((a.resourceCount ?? 0) - (b.resourceCount ?? 0)) * dir
          || a.name.localeCompare(b.name)
        );
      case "tasks":
        return (
          ((a.taskCount ?? 0) - (b.taskCount ?? 0)) * dir
          || a.name.localeCompare(b.name)
        );
      case "dailies":
        return (
          ((a.dailyCount ?? 0) - (b.dailyCount ?? 0)) * dir
          || a.name.localeCompare(b.name)
        );
    }
  });
}

export interface TopicsListProps {
  topics: TopicForTopicsPage[];
  domains: Domain[];
  // Deletes the given topics; the caller owns the network call, query
  // invalidation, and success/error toast. Rejects on failure so the confirm
  // dialog stays open for a retry.
  onBulkDelete: (ids: string[]) => Promise<void>;
}

export function TopicsList({
  topics, domains, onBulkDelete,
}: TopicsListProps) {
  const [search, setSearch] = useState("");
  const [filterDomain, setFilterDomain] = useState<string | undefined>();
  const [sort, setSort] = useState<TopicsTableSort>(DEFAULT_SORT);
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = topics.filter(t => t.name !== "");

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => {
        const nameMatch = t.name.toLowerCase().includes(q);
        const domainMatch = t.domains?.some(d =>
          d.title.toLowerCase().includes(q));
        return nameMatch || domainMatch;
      });
    }

    if (filterDomain === "none") {
      result = result.filter(t => !t.domains || t.domains.length === 0);
    }
    else if (filterDomain) {
      result = result.filter(t =>
        t.domains?.some(d => d.id === filterDomain));
    }

    return sortTopics(result, sort);
  }, [topics, search, filterDomain, sort]);

  const filteredIds = useMemo(
    () => filteredAndSorted.map(t => t.id),
    [filteredAndSorted],
  );

  useEffect(() => {
    if (viewMode !== "table" && selectedIds.size > 0) {
      setSelectedIds(new Set());
    }
  }, [viewMode, selectedIds]);

  useEffect(() => {
    if (selectedIds.size === 0) return;
    const visible = new Set(filteredIds);
    let changed = false;
    const next = new Set<string>();
    selectedIds.forEach((id) => {
      if (visible.has(id)) {
        next.add(id);
      }
      else {
        changed = true;
      }
    });
    if (changed) setSelectedIds(next);
  }, [filteredIds, selectedIds]);

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setIsDeleting(true);
    try {
      await onBulkDelete(ids);
      setSelectedIds(new Set());
      setConfirmOpen(false);
    }
    catch {
      // The caller surfaces the error; keep the dialog open for a retry.
    }
    finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters = filterDomain;

  const totalTopicCount = useMemo(
    () => topics.filter(t => t.name !== "").length,
    [topics],
  );
  const noDomainCount = useMemo(
    () =>
      topics.filter(
        t => t.name !== "" && (!t.domains || t.domains.length === 0),
      ).length,
    [topics],
  );

  return (
    <>
      <div className="container flex flex-col gap-4">
        <div>
          {topics.length > 0 && (
            <div
              className="mb-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex flex-wrap items-center gap-3">
                <ListSearchInput
                  placeholder="Search topics..."
                  value={search}
                  onChange={setSearch}
                />

                <FilterSelect
                  placeholder="Domain"
                  value={filterDomain}
                  onChange={setFilterDomain}
                  allLabel="All Domains"
                  totalCount={totalTopicCount}
                  noneLabel="No Domain"
                  noneCount={noDomainCount}
                  options={domains
                    .filter(d => (d.topicCount ?? 0) > 0)
                    .map(d => ({
                      value: d.id,
                      label: d.title,
                      count: d.topicCount ?? 0,
                    }))}
                />

                {hasActiveFilters && (
                  <ClearFiltersButton
                    onClick={() => {
                      setFilterDomain(undefined);
                    }}
                  />
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort</span>
                <Select
                  value={sortToOption(sort)}
                  onValueChange={(v) => {
                    const option = v as SortOption;
                    if (option === "custom") return;
                    setSort(optionToSort(option));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alpha-asc">A-Z</SelectItem>
                    <SelectItem value="alpha-desc">Z-A</SelectItem>
                    <SelectItem value="resources-desc">
                      Number of linked resources
                    </SelectItem>
                    <SelectItem value="tasks-desc">
                      Number of linked tasks
                    </SelectItem>
                    <SelectItem value="dailies-desc">
                      Number of linked dailies
                    </SelectItem>
                    {sortToOption(sort) === "custom" && (
                      <SelectItem value="custom">Custom</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <ViewModeToggle
                  viewMode={viewMode}
                  onChange={updateViewMode}
                  gridLabel="Card view"
                />
              </div>
            </div>
          )}
        </div>
        {topics.length === 0 && (
          <OnboardingEmptyState message="No courses yet!" />
        )}

        {topics.length > 0 && filteredAndSorted.length === 0 && (
          <div className="text-muted-foreground">
            <i>No topics match your filters.</i>
          </div>
        )}

        {viewMode === "grid" && (
          <div className="card-grid">
            {filteredAndSorted.length > 0
              && filteredAndSorted.map((topic: TopicForTopicsPage) => {
                return (
                  <TopicBox
                    {...topic}
                    key={topic.id}
                  />
                );
              })}

            <Link
              to="/topics/$id/edit"
              params={{
                id: "new",
              }}
            >
              <ContentBox
                className="
                  h-full items-center justify-center border-dashed p-8
                  text-muted-foreground transition-colors
                  hover:border-solid hover:bg-accent
                  hover:text-accent-foreground
                "
              >
                <PlusIcon size={32} />
                <span className="text-lg font-medium">Add New Topic</span>
              </ContentBox>
            </Link>
          </div>
        )}

        {viewMode === "table" && (
          <div className="flex flex-col gap-4">
            {filteredAndSorted.length > 0 && (
              <>
                <div
                  className="
                    flex min-h-9 flex-wrap items-center justify-between gap-2
                  "
                >
                  <span className="text-sm text-muted-foreground">
                    {selectedIds.size > 0 ? `${selectedIds.size} selected` : ""}
                  </span>
                  {selectedIds.size > 0 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedIds(new Set())}
                      >
                        Clear selection
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setConfirmOpen(true)}
                      >
                        <Trash2Icon className="size-4" />
                        Delete
                        {" "}
                        {selectedIds.size}
                      </Button>
                    </div>
                  )}
                </div>
                <TopicsTable
                  topics={filteredAndSorted}
                  selection={{
                    selectedIds,
                    onSelectionChange: setSelectedIds,
                  }}
                  sort={sort}
                  onSortChange={setSort}
                />
              </>
            )}
            <div>
              <Link
                to="/topics/$id/edit"
                params={{
                  id: "new",
                }}
              >
                <Button variant="outline">
                  <PlusIcon className="size-4" />
                  Add New Topic
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title={
          selectedIds.size === 1
            ? "Delete 1 topic?"
            : `Delete ${selectedIds.size} topics?`
        }
        description="This will remove the selected topics and any links to courses, domains, and radar blips. This cannot be undone."
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        onConfirm={handleBulkDelete}
        onCancel={() => {
          if (!isDeleting) setConfirmOpen(false);
        }}
      />
    </>
  );
}
