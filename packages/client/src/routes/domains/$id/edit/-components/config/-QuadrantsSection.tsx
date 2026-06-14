import type { QuadrantDraft } from "./-RadarConfigTab";

import { QuadrantsIllustration } from "@/components/radar/RadarConfigIllustrations";
import { Input } from "@/components/ui/input";

interface QuadrantsSectionProps {
  quadrants: QuadrantDraft[];
  quadrantCount: number;
  onChangeQuadrant: (localKey: string, name: string) => void;
}

export function QuadrantsSection({
  quadrants,
  quadrantCount,
  onChangeQuadrant,
}: QuadrantsSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl">Slices</h2>
      <p className="text-sm text-muted-foreground">
        Slices are the categories on your radar. The 5th is optional — leave it
        blank for a 4-slice radar.
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
                {idx + 1}.
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
  );
}
