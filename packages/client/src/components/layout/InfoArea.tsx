import type { InfoRowProps } from "@/components/layout/InfoRow";

interface InfoAreaProps extends InfoRowProps {
  className?: string;
}

export function InfoArea({
  header,
  condition = true,
  children,
}: InfoAreaProps) {
  if (!condition) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {header && (
        <h6 className="text-xs font-bold text-foreground/70 uppercase">{header}</h6>
      )}
      {children}
    </div>
  );
}
