import { cn } from "@/lib/utils";

interface RadialProgressProps {
  current: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  title?: string;
}

export function RadialProgress({
  current,
  total,
  size = 24,
  strokeWidth = 3,
  className,
  title,
}: RadialProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = total > 0 ? Math.max(0, Math.min(1, current / total)) : 0;
  const offset = circumference * (1 - ratio);
  const center = size / 2;
  const percent = Math.round(ratio * 100);

  return (
    <span
      className={cn("inline-flex items-center justify-center", className)}
      title={title ?? `${percent}% complete`}
      role="img"
      aria-label={`${percent}% complete`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-primary transition-[stroke-dashoffset]"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
    </span>
  );
}
