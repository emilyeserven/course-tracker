interface TagChipProps {
  tag: string;
}

export function TagChip({
  tag,
}: TagChipProps) {
  const idx = tag.indexOf(":");
  const group = idx > 0 ? tag.slice(0, idx) : null;
  const value = idx > 0 ? tag.slice(idx + 1) : tag;

  return (
    <span
      className="
        inline-flex items-center rounded-full border bg-muted/40 px-2 py-0.5
        text-xs
      "
    >
      {group && (
        <span className="mr-1 text-muted-foreground">
          {group}
          :
        </span>
      )}
      <span className="font-medium">{value}</span>
    </span>
  );
}
