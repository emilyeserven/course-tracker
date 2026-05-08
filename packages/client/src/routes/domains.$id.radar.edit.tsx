import type { RadarBlip, RadarQuadrant, RadarRing } from "@emstack/types/src";

import { useEffect, useMemo, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  EyeIcon,
  Loader2,
  PlusIcon,
  SparklesIcon,
  TrashIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/forms/input";
import { Textarea } from "@/components/forms/textarea";
import { PageHeader } from "@/components/layout/PageHeader";
import { BlipBulkAdd } from "@/components/radar/BlipBulkAdd";
import { BlipLlmAssist } from "@/components/radar/BlipLlmAssist";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createRadarBlip,
  deleteRadarBlip,
  fetchRadar,
  fetchSingleDomain,
  fetchTopics,
  upsertRadarBlip,
  upsertRadarConfig,
} from "@/utils";

export const Route = createFileRoute("/domains/$id/radar/edit")({
  component: RadarEdit,
});

interface QuadrantDraft {
  id?: string;
  name: string;
  position: number;
  localKey: string;
}

interface RingDraft {
  id?: string;
  name: string;
  position: number;
  localKey: string;
}

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
];

const DEFAULT_RINGS = ["Adopt", "Trial", "Assess", "Hold"];

const MAX_QUADRANTS = 4;
const MAX_RINGS = 4;

let localKeyCounter = 0;
function nextLocalKey() {
  localKeyCounter += 1;
  return `local-${localKeyCounter}`;
}

function quadrantsFromServer(items: RadarQuadrant[]): QuadrantDraft[] {
  return items
    .slice()
    .sort((a, b) => a.position - b.position)
    .map(q => ({
      id: q.id,
      name: q.name,
      position: q.position,
      localKey: q.id,
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
  return DEFAULT_QUADRANTS.map((name, idx) => ({
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

type AddMode = "single" | "bulk" | "llm";

function RadarEdit() {
  const {
    id,
  } = Route.useParams();
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
  const [addMode, setAddMode] = useState<AddMode>("single");

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

  const persistedQuadrantIds = useMemo(
    () => new Set((data?.quadrants ?? []).map(q => q.id)),
    [data],
  );
  const persistedRingIds = useMemo(
    () => new Set((data?.rings ?? []).map(r => r.id)),
    [data],
  );
  const allConfigPersisted
    = quadrants.every(q => q.id && persistedQuadrantIds.has(q.id))
      && rings.every(r => r.id && persistedRingIds.has(r.id));

  const topicNameById = useMemo(() => {
    const map = new Map<string, string>();
    (topics ?? []).forEach((t) => {
      map.set(t.id, t.name);
    });
    return map;
  }, [topics]);

  const usedTopicIds = useMemo(() => {
    const set = new Set<string>();
    blips.forEach((b) => {
      if (b.topicId) {
        set.add(b.topicId);
      }
    });
    return set;
  }, [blips]);

  function addQuadrant() {
    setQuadrants((prev) => {
      if (prev.length >= MAX_QUADRANTS) {
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

  function removeQuadrant(localKey: string) {
    setQuadrants(prev =>
      prev
        .filter(q => q.localKey !== localKey)
        .map((q, idx) => ({
          ...q,
          position: idx,
        })));
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
    if (quadrants.some(q => !q.name.trim())) {
      toast.error("Every quadrant needs a name.");
      return;
    }
    if (rings.some(r => !r.name.trim())) {
      toast.error("Every ring needs a name.");
      return;
    }
    if (quadrants.length > MAX_QUADRANTS) {
      toast.error(`At most ${MAX_QUADRANTS} quadrants are allowed.`);
      return;
    }
    if (rings.length > MAX_RINGS) {
      toast.error(`At most ${MAX_RINGS} rings are allowed.`);
      return;
    }
    setIsSavingConfig(true);
    try {
      await upsertRadarConfig(id, {
        quadrants: quadrants.map(q => ({
          id: q.id,
          name: q.name.trim(),
          position: q.position,
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

  function addBlipDraft() {
    if (quadrants.length === 0 || rings.length === 0) {
      toast.error("Add at least one quadrant and ring first.");
      return;
    }
    if (!allConfigPersisted) {
      toast.error("Save your quadrants and rings before adding blips.");
      return;
    }
    setBlips(prev => [
      ...prev,
      {
        topicId: "",
        description: "",
        quadrantId: quadrants[0].id ?? "",
        ringId: rings[0].id ?? "",
        localKey: nextLocalKey(),
      },
    ]);
  }

  async function saveBlip(blip: BlipDraft) {
    if (!blip.topicId) {
      toast.error("Pick a topic for this blip.");
      return;
    }
    if (!blip.quadrantId || !blip.ringId) {
      toast.error("Pick a quadrant and ring.");
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

  async function handleBulkComplete() {
    await queryClient.invalidateQueries({
      queryKey: ["radar", id],
    });
    await queryClient.invalidateQueries({
      queryKey: ["topics"],
    });
    setHydrated(false);
  }

  if (isPending) {
    return (
      <div className="p-4">
        <h1 className="mb-4 text-3xl">Loading radar...</h1>
      </div>
    );
  }

  const persistedQuadrants = quadrants.filter(
    (q): q is QuadrantDraft & { id: string } => Boolean(q.id),
  );
  const persistedRings = rings.filter(
    (r): r is RingDraft & { id: string } => Boolean(r.id),
  );

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
      <div className="container flex flex-col gap-12">
        <div
          className={`
            grid grid-cols-1 gap-8
            md:grid-cols-2
          `}
        >
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl">Quadrants</h2>
            <p className="text-sm text-muted-foreground">
              Quadrants are the categories on your radar. They are listed
              clockwise starting from the top.
            </p>
            <ul className="flex flex-col gap-2">
              {quadrants.map((q, idx) => (
                <li
                  key={q.localKey}
                  className="flex flex-row items-center gap-2"
                >
                  <span className="w-6 text-sm text-muted-foreground">
                    {idx + 1}
                    .
                  </span>
                  <Input
                    value={q.name}
                    onChange={e =>
                      setQuadrants(prev =>
                        prev.map(item =>
                          item.localKey === q.localKey
                            ? {
                              ...item,
                              name: e.target.value,
                            }
                            : item))}
                    placeholder="Quadrant name"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuadrant(q.localKey)}
                    aria-label="Remove quadrant"
                  >
                    <TrashIcon />
                  </Button>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="outline"
                onClick={addQuadrant}
                disabled={quadrants.length >= MAX_QUADRANTS}
              >
                <PlusIcon />
                {" "}
                Add Quadrant
              </Button>
              {quadrants.length >= MAX_QUADRANTS && (
                <p className="text-xs text-muted-foreground">
                  Maximum of
                  {" "}
                  {MAX_QUADRANTS}
                  {" "}
                  quadrants reached.
                </p>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-2xl">Rings</h2>
            <p className="text-sm text-muted-foreground">
              Rings represent levels — listed innermost first.
            </p>
            <ul className="flex flex-col gap-2">
              {rings.map((r, idx) => (
                <li
                  key={r.localKey}
                  className="flex flex-row items-center gap-2"
                >
                  <span className="w-6 text-sm text-muted-foreground">
                    {idx + 1}
                    .
                  </span>
                  <Input
                    value={r.name}
                    onChange={e =>
                      setRings(prev =>
                        prev.map(item =>
                          item.localKey === r.localKey
                            ? {
                              ...item,
                              name: e.target.value,
                            }
                            : item))}
                    placeholder="Ring name"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRing(r.localKey)}
                    aria-label="Remove ring"
                  >
                    <TrashIcon />
                  </Button>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="outline"
                onClick={addRing}
                disabled={rings.length >= MAX_RINGS}
              >
                <PlusIcon />
                {" "}
                Add Ring
              </Button>
              {rings.length >= MAX_RINGS && (
                <p className="text-xs text-muted-foreground">
                  Maximum of
                  {" "}
                  {MAX_RINGS}
                  {" "}
                  rings reached.
                </p>
              )}
            </div>
          </section>
        </div>

        <div>
          <Button
            type="button"
            onClick={saveConfig}
            disabled={isSavingConfig}
          >
            {isSavingConfig && <Loader2 className="animate-spin" />}
            Save Configuration
          </Button>
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl">Blips</h2>
          {!allConfigPersisted && (
            <p className="text-sm text-amber-700">
              Save your quadrants and rings before adding blips.
            </p>
          )}
          <ul className="flex flex-col gap-4">
            {blips.map(blip => (
              <li
                key={blip.localKey}
                className="flex flex-col gap-2 rounded-sm border p-4"
              >
                <div
                  className={`
                    grid grid-cols-1 gap-2
                    sm:grid-cols-2
                  `}
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase">Topic</label>
                    <Select
                      value={blip.topicId}
                      onValueChange={value =>
                        setBlips(prev =>
                          prev.map(b =>
                            b.localKey === blip.localKey
                              ? {
                                ...b,
                                topicId: value,
                              }
                              : b))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {(topics ?? [])
                          .filter(
                            t =>
                              t.id === blip.topicId || !usedTopicIds.has(t.id),
                          )
                          .map(t => (
                            <SelectItem
                              key={t.id}
                              value={t.id}
                            >
                              {t.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {blip.topicId && !topicNameById.has(blip.topicId) && (
                      <span className="text-xs text-muted-foreground">
                        (topic not in list)
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase">Quadrant</label>
                    <Select
                      value={blip.quadrantId}
                      onValueChange={value =>
                        setBlips(prev =>
                          prev.map(b =>
                            b.localKey === blip.localKey
                              ? {
                                ...b,
                                quadrantId: value,
                              }
                              : b))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose quadrant" />
                      </SelectTrigger>
                      <SelectContent>
                        {persistedQuadrants.map(q => (
                          <SelectItem
                            key={q.id}
                            value={q.id}
                          >
                            {q.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase">Ring</label>
                    <Select
                      value={blip.ringId}
                      onValueChange={value =>
                        setBlips(prev =>
                          prev.map(b =>
                            b.localKey === blip.localKey
                              ? {
                                ...b,
                                ringId: value,
                              }
                              : b))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose ring" />
                      </SelectTrigger>
                      <SelectContent>
                        {persistedRings.map(r => (
                          <SelectItem
                            key={r.id}
                            value={r.id}
                          >
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase">Description</label>
                    <Textarea
                      value={blip.description}
                      onChange={e =>
                        setBlips(prev =>
                          prev.map(b =>
                            b.localKey === blip.localKey
                              ? {
                                ...b,
                                description: e.target.value,
                              }
                              : b))}
                    />
                  </div>
                </div>
                <div className="flex flex-row gap-2">
                  <Button
                    type="button"
                    onClick={() => saveBlip(blip)}
                    disabled={pendingBlipKey === blip.localKey}
                  >
                    {pendingBlipKey === blip.localKey && (
                      <Loader2 className="animate-spin" />
                    )}
                    {blip.id ? "Update Blip" : "Save Blip"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeBlip(blip)}
                    disabled={pendingBlipKey === blip.localKey}
                  >
                    <TrashIcon />
                    {" "}
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-row flex-wrap gap-2">
            <Button
              type="button"
              variant={addMode === "single" ? "default" : "outline"}
              onClick={() => {
                setAddMode("single");
                addBlipDraft();
              }}
              disabled={!allConfigPersisted}
            >
              <PlusIcon />
              {" "}
              Add Blip
            </Button>
            <Button
              type="button"
              variant={addMode === "bulk" ? "default" : "outline"}
              onClick={() =>
                setAddMode(addMode === "bulk" ? "single" : "bulk")}
              disabled={!allConfigPersisted}
            >
              Bulk Add
            </Button>
            <Button
              type="button"
              variant={addMode === "llm" ? "default" : "outline"}
              onClick={() => setAddMode(addMode === "llm" ? "single" : "llm")}
              disabled={!allConfigPersisted}
            >
              <SparklesIcon />
              {" "}
              LLM Assisted Mode
            </Button>
          </div>

          {addMode === "bulk" && allConfigPersisted && (
            <BlipBulkAdd
              domainId={id}
              quadrants={persistedQuadrants}
              rings={persistedRings}
              topics={topics ?? []}
              onComplete={handleBulkComplete}
            />
          )}
          {addMode === "llm" && allConfigPersisted && (
            <BlipLlmAssist
              domainId={id}
              domainTitle={data?.domainTitle ?? ""}
              domainDescription={domainDetail?.description ?? null}
              domainTopics={domainDetail?.topics ?? []}
              excludedTopics={domainDetail?.excludedTopics ?? []}
              quadrants={persistedQuadrants}
              rings={persistedRings}
              topics={topics ?? []}
              existingBlips={data?.blips ?? []}
              onComplete={handleBulkComplete}
            />
          )}
        </section>

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
