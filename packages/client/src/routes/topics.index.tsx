import type { TopicForTopicsPage } from "@emstack/types/src";

import { useEffect, useMemo, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  LayoutGridIcon,
  ListIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { ContentBox } from "@/components/boxes/ContentBox";
import { TopicBox } from "@/components/boxes/TopicBox";
import { TopicsTable } from "@/components/boxes/TopicsTable";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EntityError, EntityPending } from "@/components/EntityStates";
import { FilterOptionCount } from "@/components/FilterOptionCount";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bulkDeleteTopics, fetchDomains, fetchTopics } from "@/utils";

type SortOption = "alpha-asc" | "alpha-desc" | "resources";
type ViewMode = "grid" | "table";

const VIEW_MODE_STORAGE_KEY = "topics:viewMode";

function getInitialViewMode(): ViewMode {
  if (typeof window === "undefined") return "grid";
  const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
  return stored === "table" ? "table" : "grid";
}

export const Route = createFileRoute("/topics/")({
  component: Topics,
  errorComponent: TopicsError,
  pendingComponent: TopicsPending,
});

function TopicsPending() {
  return <EntityPending entity="topics" />;
}

function TopicsError() {
  return <EntityError entity="topics" />;
}

function sortTopics(
  topics: TopicForTopicsPage[],
  sortBy: SortOption,
): TopicForTopicsPage[] {
  return [...topics].sort((a, b) => {
    switch (sortBy) {
      case "alpha-asc":
        return a.name.localeCompare(b.name);
      case "alpha-desc":
        return b.name.localeCompare(a.name);
      case "resources":
        return (b.resourceCount ?? 0) - (a.resourceCount ?? 0);
    }
  });
}

function Topics() {
  const [search, setSearch] = useState("");
  const [filterDomain, setFilterDomain] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<SortOption>("alpha-asc");
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const updateViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    }
  };

  const {
    data,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: () => fetchTopics(),
  });

  const {
    data: domains,
  } = useQuery({
    queryKey: ["domains"],
    queryFn: () => fetchDomains(),
  });

  const filteredAndSorted = useMemo(() => {
    if (!data) return [];

    let result = data.filter(t => t.name !== "");

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

    return sortTopics(result, sortBy);
  }, [data, search, filterDomain, sortBy]);

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

  const handleToggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleAll = (selectAll: boolean) => {
    setSelectedIds(selectAll ? new Set(filteredIds) : new Set());
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setIsDeleting(true);
    try {
      await bulkDeleteTopics(ids);
      await queryClient.invalidateQueries({
        queryKey: ["topics"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["domains"],
      });
      setSelectedIds(new Set());
      setConfirmOpen(false);
      toast.success(
        ids.length === 1
          ? "1 topic deleted."
          : `${ids.length} topics deleted.`,
      );
    }
    catch {
      toast.error("Failed to delete topics. Please try again.");
    }
    finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters = filterDomain;

  const totalTopicCount = useMemo(
    () => data?.filter(t => t.name !== "").length ?? 0,
    [data],
  );
  const noDomainCount = useMemo(
    () =>
      data?.filter(
        t => t.name !== "" && (!t.domains || t.domains.length === 0),
      ).length ?? 0,
    [data],
  );

  return (
    <div>
      <PageHeader
        pageTitle="Topics"
        pageSection=""
      />
      <div className="container flex flex-col gap-4">
        <div>
          {data && data.length > 0 && (
            <div
              className="mb-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <SearchIcon
                    className="
                      absolute top-1/2 left-2.5 size-4 -translate-y-1/2
                      text-muted-foreground
                    "
                  />
                  <input
                    type="text"
                    placeholder="Search topics..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="
                      h-9 rounded-md border border-input bg-transparent pr-3
                      pl-8 text-sm shadow-xs transition-[color,box-shadow]
                      outline-none
                      placeholder:text-muted-foreground
                      focus-visible:border-ring focus-visible:ring-[3px]
                      focus-visible:ring-ring/50
                    "
                  />
                </div>

                <Select
                  value={filterDomain ?? "all"}
                  onValueChange={v =>
                    setFilterDomain(v === "all" ? undefined : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <span>All Domains</span>
                      <FilterOptionCount count={totalTopicCount} />
                    </SelectItem>
                    {noDomainCount > 0 && (
                      <SelectItem value="none">
                        <span>No Domain</span>
                        <FilterOptionCount count={noDomainCount} />
                      </SelectItem>
                    )}
                    {domains?.filter(d => (d.topicCount ?? 0) > 0).map(d => (
                      <SelectItem
                        key={d.id}
                        value={d.id}
                      >
                        <span>{d.title}</span>
                        <FilterOptionCount count={d.topicCount ?? 0} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilterDomain(undefined);
                    }}
                  >
                    <XIcon className="size-4" />
                    Clear filters
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort</span>
                <Select
                  value={sortBy}
                  onValueChange={v => setSortBy(v as SortOption)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alpha-asc">A-Z</SelectItem>
                    <SelectItem value="alpha-desc">Z-A</SelectItem>
                    <SelectItem value="resources">
                      Number of linked resources
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div
                  className="
                    ml-2 flex items-center rounded-md border border-input
                    bg-transparent
                  "
                  role="group"
                  aria-label="View mode"
                >
                  <Button
                    type="button"
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    aria-label="Card view"
                    aria-pressed={viewMode === "grid"}
                    onClick={() => updateViewMode("grid")}
                  >
                    <LayoutGridIcon className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={viewMode === "table" ? "secondary" : "ghost"}
                    size="icon"
                    aria-label="Table view"
                    aria-pressed={viewMode === "table"}
                    onClick={() => updateViewMode("table")}
                  >
                    <ListIcon className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        {(!data || data.length === 0) && (
          <div className="flex flex-col gap-6">
            <i>No courses yet!</i>

            <Link
              to="/onboard"
              className=""
            >
              <Button>
                Go to onboarding
                {" "}
                <ArrowRightIcon />
              </Button>
            </Link>
          </div>
        )}

        {data && data.length > 0 && filteredAndSorted.length === 0 && (
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
                    {selectedIds.size > 0
                      ? `${selectedIds.size} selected`
                      : ""}
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
                    onToggleSelected: handleToggleSelected,
                    onToggleAll: handleToggleAll,
                  }}
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
    </div>
  );
}
