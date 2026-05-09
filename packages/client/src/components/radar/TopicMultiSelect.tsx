import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/combobox";

interface TopicMultiSelectProps {
  options: { value: string;
    label: string; }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function TopicMultiSelect({
  options,
  value,
  onChange,
  placeholder,
}: TopicMultiSelectProps) {
  const anchor = useComboboxAnchor();
  const optionsMap = new Map(options.map(o => [o.value, o.label]));

  return (
    <Combobox
      multiple
      items={options.map(o => o.value)}
      value={value}
      onValueChange={(val: string[]) => onChange(val)}
      itemToStringLabel={(val: string) => optionsMap.get(val) ?? ""}
    >
      <ComboboxChips ref={anchor}>
        {value.map(val => (
          <ComboboxChip
            key={val}
            value={val}
          >
            {optionsMap.get(val) ?? val}
          </ComboboxChip>
        ))}
        <ComboboxChipsInput placeholder={placeholder} />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No topics found.</ComboboxEmpty>
        <ComboboxList>
          {(val: string) => (
            <ComboboxItem
              key={val}
              value={val}
            >
              {optionsMap.get(val) ?? val}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
