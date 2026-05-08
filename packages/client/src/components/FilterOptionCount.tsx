interface FilterOptionCountProps {
  count: number;
}

export function FilterOptionCount({
  count,
}: FilterOptionCountProps) {
  return (
    <span
      className="text-muted-foreground ml-auto pl-3 text-xs tabular-nums"
    >
      {count}
    </span>
  );
}
