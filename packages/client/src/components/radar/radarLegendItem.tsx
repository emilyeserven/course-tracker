import type { RadarBlip } from "@emstack/types";
import type { ReactNode } from "react";

import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { BlipDescriptionPopover } from "@/components/radar/BlipDescriptionPopover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BlipLegendItemProps {
  blip: RadarBlip;
  /** Inner content of the clickable title button (e.g. index + name + ring). */
  label: ReactNode;
  isActive: boolean;
  isSelected: boolean;
  registerRef: (id: string, el: HTMLLIElement | null) => void;
  onHover: (id: string | null) => void;
  onBlipClick: (blip: RadarBlip) => void;
  onDescriptionChange: (blipId: string, value: string) => void;
}

interface SimpleBlipLegendSectionProps {
  title: string;
  /** className for the section heading (color varies by section). */
  headingClassName: string;
  blips: RadarBlip[];
  activeBlipId: string | null;
  selectedBlipId: string | null;
  registerRef: (id: string, el: HTMLLIElement | null) => void;
  onHover: (id: string | null) => void;
  onBlipClick: (blip: RadarBlip) => void;
  onDescriptionChange: (blipId: string, value: string) => void;
}

/**
 * A legend section that lists blips by topic name only (used by the adopted and
 * ignored groups, which differ solely by their heading text and color).
 */
export function SimpleBlipLegendSection({
  title,
  headingClassName,
  blips,
  activeBlipId,
  selectedBlipId,
  registerRef,
  onHover,
  onBlipClick,
  onDescriptionChange,
}: SimpleBlipLegendSectionProps) {
  return (
    <div className="flex flex-col gap-1">
      <h4 className={headingClassName}>{title}</h4>
      <ul className="flex flex-col gap-0.5">
        {blips.map(blip => (
          <BlipLegendItem
            key={blip.id}
            blip={blip}
            isActive={activeBlipId === blip.id}
            isSelected={selectedBlipId === blip.id}
            registerRef={registerRef}
            onHover={onHover}
            onBlipClick={onBlipClick}
            onDescriptionChange={onDescriptionChange}
            label={<span className="font-medium">{blip.topicName}</span>}
          />
        ))}
      </ul>
    </div>
  );
}

/** A single blip row in the radar legend (quadrant, adopted, and ignored lists). */
export function BlipLegendItem({
  blip,
  label,
  isActive,
  isSelected,
  registerRef,
  onHover,
  onBlipClick,
  onDescriptionChange,
}: BlipLegendItemProps) {
  const description = blip.description ?? "";
  return (
    <li
      key={blip.id}
      ref={el => registerRef(blip.id, el)}
      onMouseEnter={() => onHover(blip.id)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        "group flex flex-col rounded-sm px-1 py-0.5 text-sm transition-colors",
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
          {label}
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
          className="mt-0.5 ml-4 text-xs text-muted-foreground italic"
        >
          {description}
        </p>
      )}
    </li>
  );
}
