import type { PositionedBlip } from "@/components/radar/radarLayout";
import type { RadarBlip, RadarQuadrant, RadarRing } from "@emstack/types";

import { useCallback, useEffect, useMemo, useRef } from "react";

import { QUADRANT_PALETTE } from "@/components/radar/radarLayout";
import { BlipLegendSection } from "@/components/radar/radarLegendItem";

interface RadarLegendProps {
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  positionedBlips: PositionedBlip[];
  adoptedBlips: RadarBlip[];
  adoptedSectionName: string;
  ignoredBlips: RadarBlip[];
  onDescriptionChange: (blipId: string, value: string) => void;
  activeBlipId: string | null;
  selectedBlipId: string | null;
  onHover: (id: string | null) => void;
  onBlipClick: (blip: RadarBlip) => void;
}

export function RadarLegend({
  quadrants,
  rings,
  positionedBlips,
  adoptedBlips,
  adoptedSectionName,
  ignoredBlips,
  onDescriptionChange,
  activeBlipId,
  selectedBlipId,
  onHover,
  onBlipClick,
}: RadarLegendProps) {
  const ringNameById = useMemo(() => {
    const map: Record<string, string> = {};
    rings.forEach((r) => {
      map[r.id] = r.name;
    });
    return map;
  }, [rings]);

  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const containerRef = useRef<HTMLDivElement | null>(null);

  const registerRef = useCallback((id: string, el: HTMLLIElement | null) => {
    if (el) {
      itemRefs.current.set(id, el);
    }
    else {
      itemRefs.current.delete(id);
    }
  }, []);

  // Gently scroll the hovered/selected list item into view inside the side
  // panel.
  useEffect(() => {
    if (!activeBlipId) return;
    const el = itemRefs.current.get(activeBlipId);
    const container = containerRef.current;
    if (!el || !container) return;
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    if (
      elRect.top < containerRect.top
      || elRect.bottom > containerRect.bottom
    ) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeBlipId]);

  return (
    <div
      ref={containerRef}
      className={`
        grid grid-cols-1 gap-4
        sm:grid-cols-2
        lg:grid lg:max-h-[600px] lg:grid-cols-1 lg:overflow-y-auto lg:pr-1
      `}
    >
      {quadrants.map((q, idx) => {
        const color = QUADRANT_PALETTE[idx % QUADRANT_PALETTE.length];
        const items = positionedBlips
          .filter(pb => pb.blip.quadrantId === q.id)
          .map(({
            blip, index,
          }) => ({
            blip,
            label: (
              <>
                <span
                  className="mr-1 inline-block font-mono text-xs"
                  style={{
                    color,
                  }}
                >
                  {index}.
                </span>
                <span className="font-medium">{blip.topicName}</span>
                <span className="ml-1 text-xs text-muted-foreground">
                  ({ringNameById[blip.ringId ?? ""]})
                </span>
              </>
            ),
          }));
        return (
          <BlipLegendSection
            key={q.id}
            title={q.name}
            headingClassName="text-sm font-semibold uppercase"
            headingStyle={{
              color,
            }}
            items={items}
            emptyMessage="No blips yet."
            activeBlipId={activeBlipId}
            selectedBlipId={selectedBlipId}
            registerRef={registerRef}
            onHover={onHover}
            onBlipClick={onBlipClick}
            onDescriptionChange={onDescriptionChange}
          />
        );
      })}
      {adoptedBlips.length > 0 && (
        <BlipLegendSection
          title={adoptedSectionName}
          headingClassName="text-sm font-semibold text-amber-700 uppercase dark:text-amber-400"
          items={adoptedBlips.map(blip => ({
            blip,
            label: <span className="font-medium">{blip.topicName}</span>,
          }))}
          activeBlipId={activeBlipId}
          selectedBlipId={selectedBlipId}
          registerRef={registerRef}
          onHover={onHover}
          onBlipClick={onBlipClick}
          onDescriptionChange={onDescriptionChange}
        />
      )}
      {ignoredBlips.length > 0 && (
        <BlipLegendSection
          title="Ignored"
          headingClassName="text-sm font-semibold text-muted-foreground uppercase"
          items={ignoredBlips.map(blip => ({
            blip,
            label: <span className="font-medium">{blip.topicName}</span>,
          }))}
          activeBlipId={activeBlipId}
          selectedBlipId={selectedBlipId}
          registerRef={registerRef}
          onHover={onHover}
          onBlipClick={onBlipClick}
          onDescriptionChange={onDescriptionChange}
        />
      )}
    </div>
  );
}
