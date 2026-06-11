import type { RadarBlip } from "@emstack/types";
import type { ReactNode } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RadarBlipDotProps {
  blip: RadarBlip;
  x: number;
  y: number;
  index: number;
  color: string;
  dotRadius: number;
  haloRadius: number;
  fontSize: number;
  subtitle: ReactNode;
  isActive: boolean;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onClick: (blip: RadarBlip) => void;
}

// One blip dot on the radar SVG (main circle, Adopted strip, or Ignored
// strip) together with its tooltip. The parent controls the key prefix and
// the active-blip-rendered-last ordering.
export function RadarBlipDot({
  blip,
  x,
  y,
  index,
  color,
  dotRadius,
  haloRadius,
  fontSize,
  subtitle,
  isActive,
  isSelected,
  onHover,
  onClick,
}: RadarBlipDotProps) {
  return (
    <Tooltip
      open={isActive || undefined}
    >
      <TooltipTrigger asChild>
        <g
          onMouseEnter={() => onHover(blip.id)}
          onMouseLeave={() => onHover(null)}
          onFocus={() => onHover(blip.id)}
          onBlur={() => onHover(null)}
          onClick={(e) => {
            e.stopPropagation();
            onClick(blip);
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
              r={haloRadius}
              fill="none"
              stroke={color}
              strokeWidth={isSelected ? 3 : 2}
              strokeOpacity={isSelected ? 0.8 : 0.5}
            />
          )}
          <circle
            cx={x}
            cy={y}
            r={isActive ? dotRadius + 2 : dotRadius}
            fill={color}
            stroke="white"
            strokeWidth={2}
          />
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={fontSize}
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
            {subtitle}
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
}
