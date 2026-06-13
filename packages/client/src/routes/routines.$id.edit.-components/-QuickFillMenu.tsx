import { useQuery } from "@tanstack/react-query";
import { ChevronDownIcon, WandSparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchDailyCriteriaTemplates, fetchRoutineTemplates } from "@/utils";

type QuickFillKind = "routine" | "criteria";

interface QuickFillMenuProps<T> {
  /** Which template list to fetch: routine weekly templates or criteria templates. */
  kind: QuickFillKind;
  /** Called with the chosen template; the caller applies it to its form. */
  onSelect: (template: T) => void;
}

/**
 * The "Quick Fill" dropdown shared by the Details and Status Criteria tabs. It
 * fetches its own template list (routine weekly templates or daily criteria
 * templates) so each tab only wires up an `onSelect` handler.
 */
export function QuickFillMenu<T extends { id: string;
  label: string; }>({
  kind,
  onSelect,
}: QuickFillMenuProps<T>) {
  const {
    data: templates,
  } = useQuery({
    queryKey:
      kind === "routine" ? ["routineTemplates"] : ["dailyCriteriaTemplates"],
    queryFn: (): Promise<{ id: string;
      label: string; }[]> =>
      kind === "routine"
        ? fetchRoutineTemplates()
        : fetchDailyCriteriaTemplates(),
  });

  const list = (templates ?? []) as T[];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
        >
          <WandSparklesIcon className="size-4" />
          Quick Fill
          <ChevronDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {list.length === 0
          ? (
            <DropdownMenuItem disabled>
              No templates — add one in Settings
            </DropdownMenuItem>
          )
          : list.map(template => (
            <DropdownMenuItem
              key={template.id}
              onSelect={() => onSelect(template)}
            >
              {template.label}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
