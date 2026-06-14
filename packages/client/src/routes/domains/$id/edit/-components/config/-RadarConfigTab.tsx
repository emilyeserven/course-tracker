import { Loader2 } from "lucide-react";

import { QuadrantsSection } from "./-QuadrantsSection";
import { RingsSection } from "./-RingsSection";

import { Button } from "@/components/ui/button";

export interface QuadrantDraft {
  id?: string;
  name: string;
  position: number;
  localKey: string;
}

export interface RingDraft {
  id?: string;
  name: string;
  position: number;
  localKey: string;
  isAdopted?: boolean;
}

interface RadarConfigTabProps {
  quadrants: QuadrantDraft[];
  rings: RingDraft[];
  quadrantCount: number;
  maxRings: number;
  isSaving: boolean;
  hasAdoptedSection: boolean;
  onChangeQuadrant: (localKey: string, name: string) => void;
  onChangeRing: (localKey: string, name: string) => void;
  onAddRing: () => void;
  onRemoveRing: (localKey: string) => void;
  onToggleAdoptedSection: (enabled: boolean) => void;
  onSave: () => void;
}

export function RadarConfigTab({
  quadrants,
  rings,
  quadrantCount,
  maxRings,
  isSaving,
  hasAdoptedSection,
  onChangeQuadrant,
  onChangeRing,
  onAddRing,
  onRemoveRing,
  onToggleAdoptedSection,
  onSave,
}: RadarConfigTabProps) {
  return (
    <div className="flex flex-col gap-8">
      <div
        className={`
          grid grid-cols-1 gap-8
          md:grid-cols-2
        `}
      >
        <QuadrantsSection
          quadrants={quadrants}
          quadrantCount={quadrantCount}
          onChangeQuadrant={onChangeQuadrant}
        />
        <RingsSection
          rings={rings}
          maxRings={maxRings}
          hasAdoptedSection={hasAdoptedSection}
          onChangeRing={onChangeRing}
          onAddRing={onAddRing}
          onRemoveRing={onRemoveRing}
          onToggleAdoptedSection={onToggleAdoptedSection}
        />
      </div>

      <div>
        <Button
          type="button"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="animate-spin" />}
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
