interface FilterOptionCountProps {
  count: number;
}

export function FilterOptionCount({
  count,
}: FilterOptionCountProps) {
  return (
    <span
      className="ml-auto pl-3 text-xs text-muted-foreground tabular-nums"
    >
      {count}
    </span>
  );
}
