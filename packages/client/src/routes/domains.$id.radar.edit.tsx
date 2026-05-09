import type { QuadrantDraft, RingDraft } from "@/components/radar/RadarConfigTab";
import type { RadarBlip, RadarQuadrant, RadarRing } from "@emstack/types/src";

import { useEffect, useMemo, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, EyeIcon } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { BlipsTab } from "@/components/radar/BlipsTab";
import { LlmEditTab } from "@/components/radar/LlmEditTab";
import {

  RadarConfigTab,

} from "@/components/radar/RadarConfigTab";
import { ScopeTab } from "@/components/radar/ScopeTab";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  createRadarBlip,
  deleteRadarBlip,
  fetchRadar,
  fetchSingleDomain,
  fetchTopics,
  upsertDomain,
  upsertRadarBlip,
  upsertRadarConfig,
} from "@/utils";

const TAB_VALUES = ["config", "scope", "blips", "llm"] as const;
type RadarEditTab = (typeof TAB_VALUES)[number];

interface RadarEditSearch {
  tab?: RadarEditTab;
}

export const Route = createFileRoute("/domains/$id/radar/edit")({
  component: RadarEdit,
  validateSearch: (search: Record<string, unknown>): RadarEditSearch => {
    const value = search.tab;
    if (typeof value === "string" && (TAB_VALUES as readonly string[]).includes(value)) {
      return {
        tab: value as RadarEditTab,
      };
    }
    return {};
  },
});

interface BlipDraft {
  id?: string;
  topicId: string;
  description: string;
  quadrantId: string;
  ringId: string;
  localKey: string;
}

const DEFAULT_QUADRANTS = [
  "Languages & Frameworks",
  "Tools",
  "Platforms",
  "Techniques",
  "Practices",
];

const DEFAULT_RINGS = ["Adopt", "Trial", "Assess", "Hold"];

const QUADRANT_COUNT = 5;
const MAX_RINGS = 6;

let localKeyCounter = 0;
function nextLocalKey() {
  localKeyCounter += 1;
  return `local-${localKeyCounter}`;
}

function quadrantsFromServer(items: RadarQuadrant[]): QuadrantDraft[] {
  const fromServer: QuadrantDraft[] = items
    .slice()
    .sort((a, b) => a.position - b.position)
    .map(q => ({
      id: q.id,
      name: q.name,
      position: q.position,
      localKey: q.id,
    }));
  while (fromServer.length < QUADRANT_COUNT) {
    const idx = fromServer.length;
    fromServer.push({
      name: "",
      position: idx,
      localKey: nextLocalKey(),
    });
  }
  return fromServer.map((q, idx) => ({
    ...q,
    position: idx,
  }));
}

function ringsFromServer(items: RadarRing[]): RingDraft[] {
  return items
    .slice()
    .sort((a, b) => a.position - b.position)
    .map(r => ({
      id: r.id,
      name: r.name,
      position: r.position,
      localKey: r.id,
    }));
}

function defaultQuadrants(): QuadrantDraft[] {
  return DEFAULT_QUADRANTS.slice(0, QUADRANT_COUNT).map((name, idx) => ({
    name,
    position: idx,
    localKey: nextLocalKey(),
  }));
}

function defaultRings(): RingDraft[] {
  return DEFAULT_RINGS.map((name, idx) => ({
    name,
    position: idx,
    localKey: nextLocalKey(),
  }));
}

function blipsFromServer(items: RadarBlip[]): BlipDraft[] {
  return items.map(b => ({
    id: b.id,
    topicId: b.topicId,
    description: b.description ?? "",
    quadrantId: b.quadrantId,
    ringId: b.ringId,
    localKey: b.id,
  }));
}

function RadarEdit() {
  const {
    id,
  } = Route.useParams();
  const search = Route.useSearch();
  const tab: RadarEditTab = search.tab ?? "config";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data, isPending,
  } = useQuery({
    queryKey: ["radar", id],
    queryFn: () => fetchRadar(id),
  });

  const {
    data: topics,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: () => fetchTopics(),
  });

  const {
    data: domainDetail,
  } = useQuery({
    queryKey: ["domain", id],
    queryFn: () => fetchSingleDomain(id),
  });

  const [quadrants, setQuadrants] = useState<QuadrantDraft[]>([]);
  const [rings, setRings] = useState<RingDraft[]>([]);
  const [blips, setBlips] = useState<BlipDraft[]>([]);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [pendingBlipKey, setPendingBlipKey] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [withinScopeDescription, setWithinScopeDescription] = useState("");
  const [outOfScopeDescription, setOutOfScopeDescription] = useState("");
  const [withinScopeTopicIds, setWithinScopeTopicIds] = useState<string[]>([]);
  const [outOfScopeTopicIds, setOutOfScopeTopicIds] = useState<string[]>([]);
  const [detailsHydrated, setDetailsHydrated] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  useEffect(() => {
    if (!data || hydrated) {
      return;
    }
    setQuadrants(
      data.quadrants.length > 0
        ? quadrantsFromServer(data.quadrants)
        : defaultQuadrants(),
    );
    setRings(
      data.rings.length > 0 ? ringsFromServer(data.rings) : defaultRings(),
    );
    setBlips(blipsFromServer(data.blips));
    setHydrated(true);
  }, [data, hydrated]);

  useEffect(() => {
    if (!domainDetail || detailsHydrated) {
      return;
    }
    setWithinScopeDescription(domainDetail.withinScopeDescription ?? "");
    setOutOfScopeDescription(domainDetail.outOfScopeDescription ?? "");
    setWithinScopeTopicIds(
      (domainDetail.withinScopeTopics ?? []).map(t => t.id),
    );
    setOutOfScopeTopicIds((domainDetail.excludedTopics ?? []).map(t => t.id));
    setDetailsHydrated(true);
  }, [domainDetail, detailsHydrated]);

  const persistedQuadrantIds = useMemo(
    () => new Set((data?.quadrants ?? []).map(q => q.id)),
    [data],
  );
  const persistedRingIds = useMemo(
    () => new Set((data?.rings ?? []).map(r => r.id)),
    [data],
  );
  const allConfigPersisted
    = quadrants.every(
      q => !q.name.trim() || (q.id && persistedQuadrantIds.has(q.id)),
    )
    && rings.every(r => r.id && persistedRingIds.has(r.id));

  const topicNameById = useMemo(() => {
    const map = new Map<string, string>();
    (topics ?? []).forEach((t) => {
      map.set(t.id, t.name);
    });
    return map;
  }, [topics]);

  const topicById = useMemo(() => {
    const map = new Map<string, { name: string;
      description?: string | null; }>();
    (topics ?? []).forEach((t) => {
      map.set(t.id, {
        name: t.name,
        description: t.description,
      });
    });
    return map;
  }, [topics]);

  const savedBlipsForTable = useMemo(() => {
    return (data?.blips ?? []).filter(b => b.id);
  }, [data]);

  const newBlipDrafts = useMemo(() => {
    return blips.filter(b => !b.id);
  }, [blips]);

  const usedTopicIds = useMemo(() => {
    const set = new Set<string>();
    savedBlipsForTable.forEach((b) => {
      if (b.topicId) {
        set.add(b.topicId);
      }
    });
    newBlipDrafts.forEach((b) => {
      if (b.topicId) {
        set.add(b.topicId);
      }
    });
    return set;
  }, [savedBlipsForTable, newBlipDrafts]);

  const persistedQuadrants = useMemo(
    () =>
      quadrants.filter(
        (q): q is QuadrantDraft & { id: string } => Boolean(q.id),
      ),
    [quadrants],
  );
  const persistedRings = useMemo(
    () =>
      rings.filter((r): r is RingDraft & { id: string } => Boolean(r.id)),
    [rings],
  );

  function changeTab(next: RadarEditTab) {
    navigate({
      to: "/domains/$id/radar/edit",
      params: {
        id,
      },
      search: {
        tab: next,
      },
      replace: true,
    });
  }

  function changeQuadrant(localKey: string, name: string) {
    setQuadrants(prev =>
      prev.map(item =>
        item.localKey === localKey
          ? {
            ...item,
            name,
          }
          : item));
  }

  function changeRing(localKey: string, name: string) {
    setRings(prev =>
      prev.map(item =>
        item.localKey === localKey
          ? {
            ...item,
            name,
          }
          : item));
  }

  function addRing() {
    setRings((prev) => {
      if (prev.length >= MAX_RINGS) {
        return prev;
      }
      return [
        ...prev,
        {
          name: "",
          position: prev.length,
          localKey: nextLocalKey(),
        },
      ];
    });
  }

  function removeRing(localKey: string) {
    setRings(prev =>
      prev
        .filter(r => r.localKey !== localKey)
        .map((r, idx) => ({
          ...r,
          position: idx,
        })));
  }

  async function saveConfig() {
    const filledQuadrants = quadrants.filter((q, idx) => {
      if (q.name.trim()) {
        return true;
      }
      return idx < QUADRANT_COUNT - 1;
    });
    if (filledQuadrants.some(q => !q.name.trim())) {
      toast.error("Every slice needs a name (only the 5th may be empty).");
      return;
    }
    if (filledQuadrants.length === 0) {
      toast.error("Add at least one slice.");
      return;
    }
    if (rings.some(r => !r.name.trim())) {
      toast.error("Every ring needs a name.");
      return;
    }
    if (rings.length > MAX_RINGS) {
      toast.error(`At most ${MAX_RINGS} rings are allowed.`);
      return;
    }
    setIsSavingConfig(true);
    try {
      await upsertRadarConfig(id, {
        quadrants: filledQuadrants.map((q, idx) => ({
          id: q.id,
          name: q.name.trim(),
          position: idx,
        })),
        rings: rings.map(r => ({
          id: r.id,
          name: r.name.trim(),
          position: r.position,
        })),
      });
      await queryClient.invalidateQueries({
        queryKey: ["radar", id],
      });
      setHydrated(false);
      toast.success("Radar configuration saved.");
    }
    catch {
      toast.error("Failed to save radar configuration.");
    }
    finally {
      setIsSavingConfig(false);
    }
  }

  async function saveDetails() {
    if (!domainDetail) {
      return;
    }
    setIsSavingDetails(true);
    try {
      await upsertDomain(id, {
        title: domainDetail.title,
        description: domainDetail.description ?? null,
        hasRadar: domainDetail.hasRadar ?? null,
        withinScopeDescription: withinScopeDescription.trim() || null,
        outOfScopeDescription: outOfScopeDescription.trim() || null,
        withinScopeTopicIds,
        excludedTopics: outOfScopeTopicIds.map((topicId) => {
          const existing = (domainDetail.excludedTopics ?? []).find(
            t => t.id === topicId,
          );
          return {
            topicId,
            reason: existing?.reason ?? null,
          };
        }),
      });
      await queryClient.invalidateQueries({
        queryKey: ["domain", id],
      });
      setDetailsHydrated(false);
      toast.success("Details saved.");
    }
    catch {
      toast.error("Failed to save details.");
    }
    finally {
      setIsSavingDetails(false);
    }
  }

  function addBlipDraft() {
    if (persistedQuadrants.length === 0 || persistedRings.length === 0) {
      toast.error("Add at least one slice and ring first.");
      return;
    }
    if (!allConfigPersisted) {
      toast.error("Save your slices and rings before adding blips.");
      return;
    }
    setBlips(prev => [
      ...prev,
      {
        topicId: "",
        description: "",
        quadrantId: persistedQuadrants[0].id,
        ringId: persistedRings[0].id,
        localKey: nextLocalKey(),
      },
    ]);
  }

  function changeBlipTopic(localKey: string, topicId: string) {
    setBlips(prev =>
      prev.map(b =>
        b.localKey === localKey
          ? {
            ...b,
            topicId,
          }
          : b));
  }

  function changeBlipQuadrant(localKey: string, quadrantId: string) {
    setBlips(prev =>
      prev.map(b =>
        b.localKey === localKey
          ? {
            ...b,
            quadrantId,
          }
          : b));
  }

  function changeBlipRing(localKey: string, ringId: string) {
    setBlips(prev =>
      prev.map(b =>
        b.localKey === localKey
          ? {
            ...b,
            ringId,
          }
          : b));
  }

  function changeBlipDescription(localKey: string, description: string) {
    setBlips(prev =>
      prev.map(b =>
        b.localKey === localKey
          ? {
            ...b,
            description,
          }
          : b));
  }

  async function saveBlip(blip: BlipDraft) {
    if (!blip.topicId) {
      toast.error("Pick a topic for this blip.");
      return;
    }
    if (!blip.quadrantId || !blip.ringId) {
      toast.error("Pick a slice and ring.");
      return;
    }
    setPendingBlipKey(blip.localKey);
    try {
      const payload = {
        topicId: blip.topicId,
        description: blip.description.trim() || null,
        quadrantId: blip.quadrantId,
        ringId: blip.ringId,
      };
      if (blip.id) {
        await upsertRadarBlip(id, blip.id, payload);
      }
      else {
        const result = await createRadarBlip(id, payload);
        setBlips(prev =>
          prev.map(b =>
            b.localKey === blip.localKey
              ? {
                ...b,
                id: result.id,
              }
              : b));
      }
      await queryClient.invalidateQueries({
        queryKey: ["radar", id],
      });
      toast.success("Blip saved.");
    }
    catch {
      toast.error("Failed to save blip.");
    }
    finally {
      setPendingBlipKey(null);
    }
  }

  async function removeBlip(blip: BlipDraft) {
    if (blip.id) {
      setPendingBlipKey(blip.localKey);
      try {
        await deleteRadarBlip(id, blip.id);
        await queryClient.invalidateQueries({
          queryKey: ["radar", id],
        });
      }
      catch {
        toast.error("Failed to delete blip.");
        setPendingBlipKey(null);
        return;
      }
      setPendingBlipKey(null);
    }
    setBlips(prev => prev.filter(b => b.localKey !== blip.localKey));
  }

  async function handleTableSave(
    blip: RadarBlip,
    patch: { quadrantId: string;
      ringId: string;
      description: string | null; },
  ) {
    try {
      await upsertRadarBlip(id, blip.id, {
        topicId: blip.topicId,
        quadrantId: patch.quadrantId,
        ringId: patch.ringId,
        description: patch.description,
      });
      await queryClient.invalidateQueries({
        queryKey: ["radar", id],
      });
      toast.success("Blip saved.");
    }
    catch {
      toast.error("Failed to save blip.");
      throw new Error("save failed");
    }
  }

  async function handleTableRemove(blip: RadarBlip) {
    try {
      await deleteRadarBlip(id, blip.id);
      await queryClient.invalidateQueries({
        queryKey: ["radar", id],
      });
    }
    catch {
      toast.error("Failed to delete blip.");
      throw new Error("delete failed");
    }
  }

  async function handleLlmComplete() {
    await queryClient.invalidateQueries({
      queryKey: ["radar", id],
    });
    await queryClient.invalidateQueries({
      queryKey: ["topics"],
    });
    setHydrated(false);
    changeTab("blips");
  }

  if (isPending) {
    return (
      <div className="p-4">
        <h1 className="mb-4 text-3xl">Loading radar...</h1>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        pageTitle="Edit Radar"
        pageSection="domains"
      >
        <div className="flex flex-row gap-2">
          <Link
            to="/domains/$id"
            params={{
              id,
            }}
          >
            <Button variant="outline">
              <ArrowLeftIcon />
              {" "}
              Back to Domain
            </Button>
          </Link>
          <Link
            to="/domains/$id/radar"
            params={{
              id,
            }}
          >
            <Button variant="secondary">
              View Radar
              {" "}
              <EyeIcon />
            </Button>
          </Link>
        </div>
      </PageHeader>
      <div className="container flex flex-col gap-6">
        <Tabs
          value={tab}
          onValueChange={value => changeTab(value as RadarEditTab)}
        >
          <TabsList>
            <TabsTrigger value="config">Radar Config</TabsTrigger>
            <TabsTrigger value="scope">Scope</TabsTrigger>
            <TabsTrigger value="blips">Blips</TabsTrigger>
            <TabsTrigger value="llm">LLM Edit</TabsTrigger>
          </TabsList>

          <TabsContent value="config">
            <RadarConfigTab
              quadrants={quadrants}
              rings={rings}
              quadrantCount={QUADRANT_COUNT}
              maxRings={MAX_RINGS}
              isSaving={isSavingConfig}
              onChangeQuadrant={changeQuadrant}
              onChangeRing={changeRing}
              onAddRing={addRing}
              onRemoveRing={removeRing}
              onSave={saveConfig}
            />
          </TabsContent>

          <TabsContent value="scope">
            <ScopeTab
              topics={topics ?? []}
              withinScopeDescription={withinScopeDescription}
              outOfScopeDescription={outOfScopeDescription}
              withinScopeTopicIds={withinScopeTopicIds}
              outOfScopeTopicIds={outOfScopeTopicIds}
              onChangeWithinScopeDescription={setWithinScopeDescription}
              onChangeOutOfScopeDescription={setOutOfScopeDescription}
              onChangeWithinScopeTopicIds={setWithinScopeTopicIds}
              onChangeOutOfScopeTopicIds={setOutOfScopeTopicIds}
              onSave={saveDetails}
              isSaving={isSavingDetails}
              canSave={Boolean(domainDetail)}
            />
          </TabsContent>

          <TabsContent value="blips">
            <BlipsTab
              allConfigPersisted={allConfigPersisted}
              savedBlipsForTable={savedBlipsForTable}
              newBlipDrafts={newBlipDrafts}
              persistedQuadrants={persistedQuadrants}
              persistedRings={persistedRings}
              topics={topics ?? []}
              usedTopicIds={usedTopicIds}
              pendingBlipKey={pendingBlipKey}
              topicById={topicById}
              topicNameById={topicNameById}
              onAddBlip={addBlipDraft}
              onChangeBlipTopic={changeBlipTopic}
              onChangeBlipQuadrant={changeBlipQuadrant}
              onChangeBlipRing={changeBlipRing}
              onChangeBlipDescription={changeBlipDescription}
              onSaveBlip={saveBlip}
              onRemoveBlip={removeBlip}
              onTableSave={handleTableSave}
              onTableRemove={handleTableRemove}
            />
          </TabsContent>

          <TabsContent value="llm">
            <LlmEditTab
              allConfigPersisted={allConfigPersisted}
              domainId={id}
              domainTitle={data?.domainTitle ?? ""}
              domainDescription={domainDetail?.description ?? null}
              domainTopics={domainDetail?.topics ?? []}
              excludedTopics={domainDetail?.excludedTopics ?? []}
              withinScopeDescription={withinScopeDescription}
              outOfScopeDescription={outOfScopeDescription}
              withinScopeTopicNames={withinScopeTopicIds
                .map(tid => topicNameById.get(tid))
                .filter((n): n is string => Boolean(n))}
              outOfScopeTopicNames={outOfScopeTopicIds
                .map(tid => topicNameById.get(tid))
                .filter((n): n is string => Boolean(n))}
              quadrants={data?.quadrants ?? []}
              rings={data?.rings ?? []}
              topics={topics ?? []}
              existingBlips={data?.blips ?? []}
              onComplete={handleLlmComplete}
            />
          </TabsContent>
        </Tabs>

        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              navigate({
                to: "/domains/$id/radar",
                params: {
                  id,
                },
              })}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
