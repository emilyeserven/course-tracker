import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BlipPlacementOption {
  id: string;
  name: string;
}

interface BlipPlacementSelectProps {
  label: string;
  value: string;
  placeholder: string;
  options: BlipPlacementOption[];
  onValueChange: (value: string) => void;
}

/** A labelled slice/ring picker for a blip's radar placement. */
export function BlipPlacementSelect({
  label,
  value,
  placeholder,
  options,
  onValueChange,
}: BlipPlacementSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs uppercase">{label}</label>
      <Select
        value={value}
        onValueChange={onValueChange}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem
              key={option.id}
              value={option.id}
            >
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
