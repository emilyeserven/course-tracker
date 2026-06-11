import { PlusIcon } from "lucide-react";

interface ComboboxAddNewRowProps {
  itemLabel: string | undefined;
  trimmedInput: string;
  onOpenCreate: () => void;
}

// The "Add new <thing>: <typed text>" row pinned above combobox results.
export function ComboboxAddNewRow({
  itemLabel,
  trimmedInput,
  onOpenCreate,
}: ComboboxAddNewRowProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onOpenCreate();
      }}
      className="
        flex w-full items-center gap-2 border-b border-border p-2 text-left
        text-sm
        hover:bg-accent hover:text-accent-foreground
      "
    >
      <PlusIcon className="size-4" />
      <span>
        Add new
        {" "}
        {itemLabel}
        :
        {" "}
        <strong>{trimmedInput}</strong>
      </span>
    </button>
  );
}
