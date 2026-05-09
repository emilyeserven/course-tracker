import { Loader2, PlusIcon, TrashIcon } from "lucide-react";

import { Input } from "@/components/input";
import {
  QuadrantsIllustration,
  RingsIllustration,
} from "@/components/radar/RadarConfigIllustrations";
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
}

interface RadarConfigTabProps {
  quadrants: QuadrantDraft[];
  rings: RingDraft[];
  quadrantCount: number;
  maxRings: number;
  isSaving: boolean;
  onChangeQuadrant: (localKey: string, name: string) => void;
  onChangeRing: (localKey: string, name: string) => void;
  onAddRing: () => void;
  onRemoveRing: (localKey: string) => void;
  onSave: () => void;
}

export function RadarConfigTab({
  quadrants,
  rings,
  quadrantCount,
  maxRings,
  isSaving,
  onChangeQuadrant,
  onChangeRing,
  onAddRing,
  onRemoveRing,
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
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl">Slices</h2>
          <p className="text-sm text-muted-foreground">
            Slices are the categories on your radar. The 5th is optional —
            leave it blank for a 4-slice radar.
          </p>
          <div className="flex justify-center">
            <QuadrantsIllustration names={quadrants.map(q => q.name)} />
          </div>
          <ul className="flex flex-col gap-2">
            {quadrants.map((q, idx) => {
              const isOptional = idx === quadrantCount - 1;
              const isInactive = isOptional && !q.name.trim();
              return (
                <li
                  key={q.localKey}
                  className={`
                    flex flex-row items-center gap-2
                    ${isInactive ? "opacity-60" : ""}
                  `}
                >
                  <span className="w-6 text-sm text-muted-foreground">
                    {idx + 1}
                    .
                  </span>
                  <Input
                    value={q.name}
                    onChange={e => onChangeQuadrant(q.localKey, e.target.value)}
                    placeholder={
                      isOptional ? "Slice name (optional)" : "Slice name"
                    }
                  />
                </li>
              );
            })}
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl">Rings</h2>
          <p className="text-sm text-muted-foreground">
            Rings represent levels of adoption.
          </p>
          <div className="flex justify-center">
            <RingsIllustration names={rings.map(r => r.name)} />
          </div>
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
                  onChange={e => onChangeRing(r.localKey, e.target.value)}
                  placeholder="Ring name"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveRing(r.localKey)}
                  aria-label="Remove ring"
                >
                  <TrashIcon />
                </Button>
              </li>
            ))}
          </ul>
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={onAddRing}
              disabled={rings.length >= maxRings}
            >
              <PlusIcon />
              {" "}
              Add Ring
            </Button>
          </div>
        </section>
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
