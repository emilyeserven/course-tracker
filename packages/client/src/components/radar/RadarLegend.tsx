import type { PositionedBlip } from "@/components/radar/radarLayout";
import type { RadarBlip, RadarQuadrant, RadarRing } from "@emstack/types";

import { useEffect, useMemo, useRef } from "react";

import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { BlipDescriptionPopover } from "@/components/radar/BlipDescriptionPopover";
import {
  QUADRANT_PALETTE,

} from "@/components/radar/radarLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
                          {ringNameById[blip.ringId ?? ""]}
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
      {adoptedBlips.length > 0 && (
        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-semibold text-amber-700 uppercase">
            {adoptedSectionName}
          </h4>
          <ul className="flex flex-col gap-0.5">
            {adoptedBlips.map((blip) => {
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
                      <span className="font-medium">{blip.topicName}</span>
                    </button>
                    <div
                      className={cn(
                        `
                          flex items-center gap-0.5 opacity-0 transition-opacity
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
      )}
      {ignoredBlips.length > 0 && (
        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-semibold text-gray-600 uppercase">
            Ignored
          </h4>
          <ul className="flex flex-col gap-0.5">
            {ignoredBlips.map((blip) => {
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
                      <span className="font-medium">{blip.topicName}</span>
                    </button>
                    <div
                      className={cn(
                        `
                          flex items-center gap-0.5 opacity-0 transition-opacity
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
      )}
    </div>
  );
}
