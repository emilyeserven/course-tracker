import type { QuadrantDraft, RingDraft } from "./-RadarConfigTab";
import type { Radar } from "@emstack/types";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import {
  defaultQuadrants,
  defaultRings,
  MAX_RINGS,
  nextLocalKey,
  QUADRANT_COUNT,
  quadrantsFromServer,
  ringsFromServer,
} from "./-radarConfigDrafts";
import { RadarConfigTab as RadarConfigPanel } from "./-RadarConfigTab";

import { upsertRadarConfig } from "@/utils";

interface ConfigTabProps {
  radar: Radar | undefined;
  domainId: string;
  onSaved: () => Promise<void>;
}

const ADOPTED_RING_NAME = "Adopted";

export function ConfigTab({
  radar, domainId, onSaved,
}: ConfigTabProps) {
  const [quadrants, setQuadrants] = useState<QuadrantDraft[]>([]);
  const [rings, setRings] = useState<RingDraft[]>([]);
  const [hasAdoptedSection, setHasAdoptedSection] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!radar || hydrated) return;
    setQuadrants(
      radar.quadrants.length > 0
        ? quadrantsFromServer(radar.quadrants)
        : defaultQuadrants(),
    );
    setRings(
      radar.rings.length > 0 ? ringsFromServer(radar.rings) : defaultRings(),
    );
    setHasAdoptedSection(radar.hasAdoptedSection ?? false);
    setHydrated(true);
  }, [radar, hydrated]);

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
      const nonAdopted = prev.filter(r => !r.isAdopted);
      if (nonAdopted.length >= MAX_RINGS) return prev;
      const adopted = prev.filter(r => r.isAdopted);
      const next = [
        ...nonAdopted,
        {
          name: "",
          position: nonAdopted.length,
          localKey: nextLocalKey(),
        },
        ...adopted,
      ];
      return next.map((r, idx) => ({
        ...r,
        position: idx,
      }));
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

  function toggleAdoptedSection(enabled: boolean) {
    setHasAdoptedSection(enabled);
    setRings((prev) => {
      const withoutAdopted = prev.filter(r => !r.isAdopted);
      if (!enabled) {
        return withoutAdopted.map((r, idx) => ({
          ...r,
          position: idx,
        }));
      }
      const next = [
        ...withoutAdopted,
        {
          name: ADOPTED_RING_NAME,
          position: withoutAdopted.length,
          localKey: nextLocalKey(),
          isAdopted: true,
        },
      ];
      return next.map((r, idx) => ({
        ...r,
        position: idx,
      }));
    });
  }

  async function handleSave() {
    const filledQuadrants = quadrants.filter((q, idx) => {
      if (q.name.trim()) return true;
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
    const nonAdoptedRings = rings.filter(r => !r.isAdopted);
    if (nonAdoptedRings.length > MAX_RINGS) {
      toast.error(`At most ${MAX_RINGS} rings are allowed.`);
      return;
    }
    setIsSaving(true);
    try {
      await upsertRadarConfig(domainId, {
        quadrants: filledQuadrants.map((q, idx) => ({
          id: q.id,
          name: q.name.trim(),
          position: idx,
        })),
        rings: rings.map((r, idx) => ({
          id: r.id,
          name: r.name.trim(),
          position: idx,
          isAdopted: r.isAdopted ?? false,
        })),
        hasAdoptedSection,
      });
      await onSaved();
      setHydrated(false);
      toast.success("Radar configuration saved.");
    }
    catch {
      toast.error("Failed to save radar configuration.");
    }
    finally {
      setIsSaving(false);
    }
  }

  return (
    <RadarConfigPanel
      quadrants={quadrants}
      rings={rings}
      quadrantCount={QUADRANT_COUNT}
      maxRings={MAX_RINGS}
      isSaving={isSaving}
      hasAdoptedSection={hasAdoptedSection}
      onChangeQuadrant={changeQuadrant}
      onChangeRing={changeRing}
      onAddRing={addRing}
      onRemoveRing={removeRing}
      onToggleAdoptedSection={toggleAdoptedSection}
      onSave={handleSave}
    />
  );
}
