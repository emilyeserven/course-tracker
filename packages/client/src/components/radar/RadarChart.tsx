import type { RadarBlip, RadarQuadrant, RadarRing } from "@emstack/types/src";

import { useEffect, useMemo, useRef, useState } from "react";

import { Link } from "@tanstack/react-router";
import { ArrowRightIcon, PencilIcon } from "lucide-react";

import { Input } from "@/components/forms/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/popover";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface RadarChartProps {
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  blips: RadarBlip[];
  size?: number;
  onBlipClick?: (blip: RadarBlip) => void;
  onDescriptionChange?: (blipId: string, description: string) => void;
}

interface PositionedBlip {
  blip: RadarBlip;
  x: number;
  y: number;
  index: number;
}

const QUADRANT_PALETTE = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#9333ea",
  "#ea580c",
  "#0891b2",
  "#ca8a04",
  "#db2777",
];

// Deterministic pseudo-random in [0, 1) from a string. Used to keep blip
// placements stable across renders without storing coordinates in the DB.
function hashUnit(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

export function RadarChart({
  quadrants,
  rings,
  blips,
  size = 600,
  onBlipClick,
  onDescriptionChange,
}: RadarChartProps) {
  const [hoveredBlipId, setHoveredBlipId] = useState<string | null>(null);
  const [selectedBlipId, setSelectedBlipId] = useState<string | null>(null);
  const containerWrapperRef = useRef<HTMLDivElement | null>(null);

  // Click outside the chart/legend area to clear the sticky selection. Ignore
  // clicks inside Radix portals (popovers, tooltips) so editing the
  // description doesn't deselect the active blip.
  useEffect(() => {
    if (!selectedBlipId) {
      return;
    }
    function handleDown(event: MouseEvent) {
      const wrap = containerWrapperRef.current;
      if (!wrap) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (wrap.contains(target)) return;
      if (
        target.closest(
          "[data-radix-popper-content-wrapper], [data-slot=\"popover-content\"], [data-slot=\"tooltip-content\"], [data-slot=\"select-content\"]",
        )
      ) {
        return;
      }
      setSelectedBlipId(null);
    }
    document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, [selectedBlipId]);

  const activeBlipId = selectedBlipId ?? hoveredBlipId;

  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size / 2 - 24;

  const sortedQuadrants = useMemo(
    () => [...quadrants].sort((a, b) => a.position - b.position),
    [quadrants],
  );
  const sortedRings = useMemo(
    () => [...rings].sort((a, b) => a.position - b.position),
    [rings],
  );

  const quadrantCount = sortedQuadrants.length;
  const ringCount = sortedRings.length;

  const ringRadii = useMemo(() => {
    if (ringCount === 0) {
      return [];
    }
    return sortedRings.map((_ring, idx) => ((idx + 1) / ringCount) * maxRadius);
  }, [sortedRings, ringCount, maxRadius]);

  const ringNameById = useMemo(() => {
    const map: Record<string, string> = {};
    sortedRings.forEach((r) => {
      map[r.id] = r.name;
    });
    return map;
  }, [sortedRings]);

  const positionedBlips = useMemo<PositionedBlip[]>(() => {
    if (quadrantCount === 0 || ringCount === 0) {
      return [];
    }
    const angleStep = (Math.PI * 2) / quadrantCount;
    let displayIndex = 0;
    return blips
      .map((blip) => {
        const quadrantIndex = sortedQuadrants.findIndex(
          q => q.id === blip.quadrantId,
        );
        const ringIndex = sortedRings.findIndex(r => r.id === blip.ringId);
        if (quadrantIndex < 0 || ringIndex < 0) {
          return null;
        }
        const innerR = ringIndex === 0 ? 0 : ringRadii[ringIndex - 1];
        const outerR = ringRadii[ringIndex];
        const startAngle = -Math.PI / 2 + quadrantIndex * angleStep;
        // Pad away from boundaries so blips don't visually escape their cell.
        const angleSeed = hashUnit(`${blip.id}:angle`);
        const radiusSeed = hashUnit(`${blip.id}:radius`);
        const angleOffset = (0.1 + angleSeed * 0.8) * angleStep;
        const radius = innerR + (0.15 + radiusSeed * 0.7) * (outerR - innerR);
        const angle = startAngle + angleOffset;
        displayIndex += 1;
        return {
          blip,
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
          index: displayIndex,
        };
      })
      .filter((b): b is PositionedBlip => b !== null);
  }, [
    blips,
    sortedQuadrants,
    sortedRings,
    ringRadii,
    quadrantCount,
    ringCount,
    cx,
    cy,
  ]);

  if (quadrantCount === 0 || ringCount === 0) {
    return (
      <div
        className={`
          flex items-center justify-center rounded-sm border border-dashed p-8
          text-muted-foreground
        `}
        style={{
          minHeight: size / 2,
        }}
      >
        Configure at least one quadrant and one ring to display the radar.
      </div>
    );
  }

  const angleStep = (Math.PI * 2) / quadrantCount;

  const handleSetDescription = (blipId: string, value: string) => {
    onDescriptionChange?.(blipId, value);
  };

  const handleBlipClick = (blip: RadarBlip) => {
    setSelectedBlipId(prev => (prev === blip.id ? null : blip.id));
    onBlipClick?.(blip);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div
        ref={containerWrapperRef}
        className={`
          flex flex-col gap-4
          lg:flex-row lg:items-start lg:gap-6
        `}
      >
        <div className="flex-1">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            width="100%"
            style={{
              maxWidth: size,
            }}
            role="img"
            aria-label="Radar chart"
          >
            {ringRadii.map((r, idx) => (
              <circle
                key={sortedRings[idx].id}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="#d1d5db"
                strokeWidth={1}
              />
            ))}
            {sortedQuadrants.map((q, idx) => {
              const angle = -Math.PI / 2 + idx * angleStep;
              const x2 = cx + maxRadius * Math.cos(angle);
              const y2 = cy + maxRadius * Math.sin(angle);
              return (
                <line
                  key={q.id}
                  x1={cx}
                  y1={cy}
                  x2={x2}
                  y2={y2}
                  stroke="#9ca3af"
                  strokeWidth={1}
                />
              );
            })}
            {ringRadii.map((r, idx) => {
              const labelY = cy - r + 12;
              return (
                <text
                  key={`label-${sortedRings[idx].id}`}
                  x={cx}
                  y={labelY}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#6b7280"
                  fontWeight="500"
                >
                  {sortedRings[idx].name}
                </text>
              );
            })}
            {sortedQuadrants.map((q, idx) => {
              const angle = -Math.PI / 2 + (idx + 0.5) * angleStep;
              const labelRadius = maxRadius + 8;
              const x = cx + labelRadius * Math.cos(angle);
              const y = cy + labelRadius * Math.sin(angle);
              return (
                <text
                  key={`q-label-${q.id}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={13}
                  fontWeight="600"
                  fill={QUADRANT_PALETTE[idx % QUADRANT_PALETTE.length]}
                >
                  {q.name}
                </text>
              );
            })}
            {[...positionedBlips]
              .sort((a, b) => {
                const aActive = activeBlipId === a.blip.id ? 1 : 0;
                const bActive = activeBlipId === b.blip.id ? 1 : 0;
                return aActive - bActive;
              })
              .map(({
                blip, x, y, index,
              }) => {
                const quadrantIndex = sortedQuadrants.findIndex(
                  q => q.id === blip.quadrantId,
                );
                const color
                  = QUADRANT_PALETTE[quadrantIndex % QUADRANT_PALETTE.length];
                const isActive = activeBlipId === blip.id;
                const isSelected = selectedBlipId === blip.id;
                return (
                  <Tooltip
                    key={blip.id}
                    open={isActive || undefined}
                  >
                    <TooltipTrigger asChild>
                      <g
                        onMouseEnter={() => setHoveredBlipId(blip.id)}
                        onMouseLeave={() => setHoveredBlipId(null)}
                        onFocus={() => setHoveredBlipId(blip.id)}
                        onBlur={() => setHoveredBlipId(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBlipClick(blip);
                        }}
                        style={{
                          cursor: "pointer",
                        }}
                        tabIndex={0}
                      >
                        {isActive && (
                          <circle
                            cx={x}
                            cy={y}
                            r={16}
                            fill="none"
                            stroke={color}
                            strokeWidth={isSelected ? 3 : 2}
                            strokeOpacity={isSelected ? 0.8 : 0.5}
                          />
                        )}
                        <circle
                          cx={x}
                          cy={y}
                          r={isActive ? 12 : 10}
                          fill={color}
                          stroke="white"
                          strokeWidth={2}
                        />
                        <text
                          x={x}
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={10}
                          fontWeight="700"
                          fill="white"
                          style={{
                            pointerEvents: "none",
                          }}
                        >
                          {index}
                        </text>
                      </g>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-xs"
                    >
                      <div className="flex flex-col gap-0.5 text-left">
                        <div className="font-semibold">
                          {index}
                          .
                          {" "}
                          {blip.topicName}
                        </div>
                        <div className="text-[11px] opacity-80">
                          {sortedQuadrants[quadrantIndex]?.name}
                          {" · "}
                          {ringNameById[blip.ringId]}
                        </div>
                        {blip.description && (
                          <div className="text-[11px] opacity-90">
                            {blip.description}
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
          </svg>
        </div>
        <RadarLegend
          quadrants={sortedQuadrants}
          positionedBlips={positionedBlips}
          rings={sortedRings}
          onDescriptionChange={handleSetDescription}
          onHover={setHoveredBlipId}
          activeBlipId={activeBlipId}
          selectedBlipId={selectedBlipId}
          onBlipClick={handleBlipClick}
        />
      </div>
    </TooltipProvider>
  );
}

interface RadarLegendProps {
  quadrants: RadarQuadrant[];
  rings: RadarRing[];
  positionedBlips: PositionedBlip[];
  onDescriptionChange: (blipId: string, value: string) => void;
  activeBlipId: string | null;
  selectedBlipId: string | null;
  onHover: (id: string | null) => void;
  onBlipClick: (blip: RadarBlip) => void;
}

function RadarLegend({
  quadrants,
  rings,
  positionedBlips,
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
        lg:grid lg:max-h-[600px] lg:w-80 lg:grid-cols-1 lg:overflow-y-auto
        lg:pr-1
      `}
    >
      {quadrants.map((q, idx) => {
        const color = QUADRANT_PALETTE[idx % QUADRANT_PALETTE.length];
        const items = positionedBlips.filter(
          pb => pb.blip.quadrantId === q.id,
        );
        return (
          <div
            key={q.id}
            className="flex flex-col gap-1"
          >
            <h4
              className="text-sm font-semibold uppercase"
              style={{
                color,
              }}
            >
              {q.name}
            </h4>
            {items.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                No blips yet.
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {items.map(({
                blip, index,
              }) => {
                const isActive = activeBlipId === blip.id;
                const isSelected = selectedBlipId === blip.id;
                const description = blip.description ?? "";
                return (
                  <li
                    key={blip.id}
                    ref={(el) => {
                      if (el) {
                        itemRefs.current.set(blip.id, el);
                      }
                      else {
                        itemRefs.current.delete(blip.id);
                      }
                    }}
                    onMouseEnter={() => onHover(blip.id)}
                    onMouseLeave={() => onHover(null)}
                    className={cn(
                      `
                        group flex flex-col rounded-sm px-1 py-0.5 text-sm
                        transition-colors
                      `,
                      isActive && "bg-gray-200",
                      isSelected && "ring-1 ring-gray-400",
                    )}
                  >
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onBlipClick(blip);
                        }}
                        className="flex-1 cursor-pointer text-left"
                      >
                        <span
                          className="mr-1 inline-block font-mono text-xs"
                          style={{
                            color,
                          }}
                        >
                          {index}
                          .
                        </span>
                        <span className="font-medium">{blip.topicName}</span>
                        <span className="ml-1 text-xs text-muted-foreground">
                          (
                          {ringNameById[blip.ringId]}
                          )
                        </span>
                      </button>
                      <div
                        className={cn(
                          `
                            flex items-center gap-0.5 opacity-0
                            transition-opacity
                            group-hover:opacity-100
                            focus-within:opacity-100
                          `,
                          isSelected && "opacity-100",
                        )}
                      >
                        <BlipDescriptionPopover
                          value={description}
                          onChange={value => onDescriptionChange(blip.id, value)}
                        />
                        <Link
                          to="/topics/$id"
                          params={{
                            id: blip.topicId,
                          }}
                          aria-label={`Go to topic ${blip.topicName}`}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="size-6 p-0"
                          >
                            <ArrowRightIcon className="size-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                    {description && (
                      <p
                        className={`
                          mt-0.5 ml-4 text-xs text-muted-foreground italic
                        `}
                      >
                        {description}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

interface BlipDescriptionPopoverProps {
  value: string;
  onChange: (value: string) => void;
}

function BlipDescriptionPopover({
  value,
  onChange,
}: BlipDescriptionPopoverProps) {
  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState(false);

  // Keep the draft in sync if the saved value changes from elsewhere while
  // the popover is closed.
  useEffect(() => {
    if (!open) {
      setDraft(value);
    }
  }, [value, open]);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="size-6 p-0"
          aria-label="Edit blip description"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <PencilIcon className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="left"
        className="w-72"
        onClick={e => e.stopPropagation()}
      >
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onChange(draft.trim());
            setOpen(false);
          }}
        >
          <label className="text-xs font-medium">Blip description</label>
          <Input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Add a description for this blip"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setDraft(value);
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
            >
              Save
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
