import type { RingDraft } from "./-RadarConfigTab";

import { PlusIcon, TrashIcon } from "lucide-react";

import { RingsIllustration } from "@/components/radar/RadarConfigIllustrations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RingsSectionProps {
  rings: RingDraft[];
  maxRings: number;
  hasAdoptedSection: boolean;
  onChangeRing: (localKey: string, name: string) => void;
  onAddRing: () => void;
  onRemoveRing: (localKey: string) => void;
  onToggleAdoptedSection: (enabled: boolean) => void;
}

export function RingsSection({
  rings,
  maxRings,
  hasAdoptedSection,
  onChangeRing,
  onAddRing,
  onRemoveRing,
  onToggleAdoptedSection,
}: RingsSectionProps) {
  const nonAdoptedCount = rings.filter(r => !r.isAdopted).length;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl">Rings</h2>
      <p className="text-sm text-muted-foreground">
        Rings represent levels of adoption.
      </p>
      <div className="flex justify-center">
        <RingsIllustration
          names={rings.filter(r => !r.isAdopted).map(r => r.name)}
        />
      </div>
      <ul className="flex flex-col gap-2">
        {rings.map((r, idx) => (
          <li
            key={r.localKey}
            className={`
              flex flex-row items-center gap-2
              ${r.isAdopted ? "opacity-80" : ""}
            `}
          >
            <span className="w-6 text-sm text-muted-foreground">
              {idx + 1}.
            </span>
            <Input
              value={r.name}
              onChange={e => onChangeRing(r.localKey, e.target.value)}
              placeholder={r.isAdopted ? "Adopted section name" : "Ring name"}
            />
            {r.isAdopted
              ? (
                <Badge
                  className="
                    rounded-sm border-transparent bg-amber-100 px-1.5
                    text-[10px] text-amber-900
                    dark:bg-amber-900/40 dark:text-amber-200
                  "
                  title="Hidden from radar chart, listed on the side"
                >
                  Side panel
                </Badge>
              )
              : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveRing(r.localKey)}
                  aria-label="Remove ring"
                >
                  <TrashIcon />
                </Button>
              )}
          </li>
        ))}
      </ul>
      <div className="flex flex-row items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onAddRing}
          disabled={nonAdoptedCount >= maxRings}
        >
          <PlusIcon />
          {" "}
          Add Ring
        </Button>
        <label className="flex flex-row items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hasAdoptedSection}
            onChange={e => onToggleAdoptedSection(e.target.checked)}
          />
          Have Adopted Section
        </label>
      </div>
    </section>
  );
}
