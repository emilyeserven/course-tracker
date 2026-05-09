import { cn } from "@/lib/utils";

interface PillProps {
  className?: string;
  children: React.ReactNode;
}

export function Pill({
  className,
  children,
}: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}
