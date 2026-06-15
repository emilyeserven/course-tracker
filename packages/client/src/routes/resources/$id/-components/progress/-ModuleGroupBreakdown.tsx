import type { GroupProgress } from "@/utils/moduleProgress";

import { useId, useState } from "react";

import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Collapsible per-group progress table for the Details tab. Hidden entirely when
 * the resource has no groups (ungrouped modules are reflected in the aggregate
 * stats, not here). The repo has no Collapsible primitive, so this is a small
 * `useState`-controlled disclosure.
 */
export function ModuleGroupBreakdown({
  groups,
}: {
  groups: GroupProgress[];
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-start"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        {open
          ? <ChevronDownIcon className="size-4" />
          : <ChevronRightIcon className="size-4" />}
        Group breakdown
      </Button>
      {open && (
        <div
          id={panelId}
          className="rounded-md border bg-card"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead className="text-right">Modules</TableHead>
                <TableHead className="text-right">% Complete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map(g => (
                <TableRow key={g.id}>
                  <TableCell>{g.name}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {g.moduleCount}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {g.percentComplete}
                    %
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
