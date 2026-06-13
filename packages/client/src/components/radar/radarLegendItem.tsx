import type { RadarBlip } from "@emstack/types";
import type { CSSProperties, ReactNode } from "react";

import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { BlipDescriptionPopover } from "@/components/radar/BlipDescriptionPopover";
import { Button } from "@/components/ui/button";
import { EmptyHint } from "@/components/ui/EmptyHint";
import { cn } from "@/lib/utils";

/** Callbacks threaded from a legend section down to each blip row. */
interface BlipLegendHandlers {
  registerRef: (id: string, el: HTMLLIElement | null) => void;
  onHover: (id: string | null) => void;
  onBlipClick: (blip: RadarBlip) => void;
  onDescriptionChange: (blipId: string, value: string) => void;
}

interface BlipLegendItemProps extends BlipLegendHandlers {
  blip: RadarBlip;
  /** Inner content of the clickable title button (e.g. index + name + ring). */
  label: ReactNode;
  isActive: boolean;
  isSelected: boolean;
}

/** A blip plus its pre-built legend label, ready to render in a section. */
export interface BlipLegendSectionItem {
  blip: RadarBlip;
  /** Inner content of the row's clickable title button. */
  label: ReactNode;
}

interface BlipLegendSectionProps extends BlipLegendHandlers {
  title: string;
  /** className for the section heading (color varies by section). */
  headingClassName: string;
  /** Inline heading styles — quadrant headings colour themselves this way. */
  headingStyle?: CSSProperties;
  items: BlipLegendSectionItem[];
  /** Shown in place of the list when there are no items (e.g. quadrants). */
  emptyMessage?: string;
  activeBlipId: string | null;
  selectedBlipId: string | null;
}

/**
 * A legend section: a coloured heading over a list of blip rows. Callers
 * pre-build each row's `label`, so this renders the quadrant lists (index +
 * name + ring), the adopted group, and the ignored group from one definition.
 */
export function BlipLegendSection({
  title,
  headingClassName,
  headingStyle,
  items,
  emptyMessage,
  activeBlipId,
  selectedBlipId,
  registerRef,
  onHover,
  onBlipClick,
  onDescriptionChange,
}: BlipLegendSectionProps) {
  return (
    <div className="flex flex-col gap-1">
      <h4
        className={headingClassName}
        style={headingStyle}
      >
        {title}
      </h4>
      {items.length === 0 && emptyMessage !== undefined && (
        <EmptyHint asChild>
          <p>{emptyMessage}</p>
        </EmptyHint>
      )}
      <ul className="flex flex-col gap-0.5">
        {items.map(({
          blip, label,
        }) => (
          <BlipLegendItem
            key={blip.id}
            blip={blip}
            isActive={activeBlipId === blip.id}
            isSelected={selectedBlipId === blip.id}
            registerRef={registerRef}
            onHover={onHover}
            onBlipClick={onBlipClick}
            onDescriptionChange={onDescriptionChange}
            label={label}
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
        <EmptyHint
          asChild
          className="mt-0.5 ml-4"
        >
          <p>{description}</p>
        </EmptyHint>
      )}
    </li>
  );
}
