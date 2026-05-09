interface TagChipProps {
  tag: string;
}

export function TagChip({
  tag,
}: TagChipProps) {
  return (
    <span
      className="
        inline-flex items-center rounded-full border bg-muted/40 px-2 py-0.5
        text-xs
      "
    >
      <span className="font-medium">{tag}</span>
    </span>
  );
}
