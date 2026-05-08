import type { Resource, ResourceLevel } from "@emstack/types/src";

import { PlusIcon, Trash2Icon } from "lucide-react";

import { RESOURCE_LEVEL_OPTIONS } from "./resourceMeta";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uuidv4 } from "@/utils/uuid";

export type DraftResource = Pick<
  Resource,
  | "id"
  | "name"
  | "url"
  | "easeOfStarting"
  | "timeNeeded"
  | "interactivity"
  | "usedYet"
>;

interface ResourcesEditorProps {
  resources: DraftResource[];
  onChange: (resources: DraftResource[]) => void;
}

const NONE_VALUE = "__none";

function emptyResource(): DraftResource {
  return {
    id: uuidv4(),
    name: "",
    url: "",
    easeOfStarting: null,
    timeNeeded: null,
    interactivity: null,
    usedYet: false,
  };
}

function LevelSelect({
  value,
  onValueChange,
  ariaLabel,
}: {
  value: ResourceLevel | null | undefined;
  onValueChange: (next: ResourceLevel | null) => void;
  ariaLabel: string;
}) {
  return (
    <Select
      value={value ?? NONE_VALUE}
      onValueChange={(v) => {
        onValueChange(v === NONE_VALUE ? null : (v as ResourceLevel));
      }}
    >
      <SelectTrigger
        size="sm"
        aria-label={ariaLabel}
        className="w-full"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE_VALUE}>—</SelectItem>
        {RESOURCE_LEVEL_OPTIONS.map(opt => (
          <SelectItem
            key={opt.value}
            value={opt.value}
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ResourcesEditor({
  resources,
  onChange,
}: ResourcesEditorProps) {
  function update(index: number, patch: Partial<DraftResource>) {
    const next = resources.map((r, i) => (i === index
      ? {
        ...r,
        ...patch,
      }
      : r));
    onChange(next);
  }

  function remove(index: number) {
    onChange(resources.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...resources, emptyResource()]);
  }

  return (
    <div className="flex flex-col gap-3">
      {resources.length === 0 && (
        <p className="text-sm text-muted-foreground">
          <i>No resources yet. Add one below.</i>
        </p>
      )}
      {resources.map((r, i) => (
        <div
          key={r.id}
          className="flex flex-col gap-2 rounded-md border bg-card p-3"
        >
          <div
            className="
              grid grid-cols-1 gap-2
              md:grid-cols-2
            "
          >
            <div className="flex flex-col gap-1">
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor={`resource-name-${r.id}`}
              >
                Name
              </label>
              <input
                id={`resource-name-${r.id}`}
                type="text"
                value={r.name}
                onChange={e => update(i, {
                  name: e.target.value,
                })}
                className="
                  rounded-md border border-input bg-background px-2 py-1 text-sm
                  shadow-xs
                  focus-visible:border-ring focus-visible:ring-[3px]
                  focus-visible:ring-ring/50 focus-visible:outline-none
                "
                placeholder="Resource name"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor={`resource-url-${r.id}`}
              >
                URL (optional)
              </label>
              <input
                id={`resource-url-${r.id}`}
                type="url"
                value={r.url ?? ""}
                onChange={e => update(i, {
                  url: e.target.value,
                })}
                className="
                  rounded-md border border-input bg-background px-2 py-1 text-sm
                  shadow-xs
                  focus-visible:border-ring focus-visible:ring-[3px]
                  focus-visible:ring-ring/50 focus-visible:outline-none
                "
                placeholder="https://..."
              />
            </div>
          </div>
          <div
            className="
              grid grid-cols-1 gap-2
              md:grid-cols-3
            "
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Ease of Starting
              </label>
              <LevelSelect
                value={r.easeOfStarting}
                onValueChange={v => update(i, {
                  easeOfStarting: v,
                })}
                ariaLabel={`Ease of starting for ${r.name || "resource"}`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Time Needed
              </label>
              <LevelSelect
                value={r.timeNeeded}
                onValueChange={v => update(i, {
                  timeNeeded: v,
                })}
                ariaLabel={`Time needed for ${r.name || "resource"}`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Interactivity
              </label>
              <LevelSelect
                value={r.interactivity}
                onValueChange={v => update(i, {
                  interactivity: v,
                })}
                ariaLabel={`Interactivity for ${r.name || "resource"}`}
              />
            </div>
          </div>
          <div className="flex flex-row items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={r.usedYet}
                onChange={e => update(i, {
                  usedYet: e.target.checked,
                })}
                className="size-4"
              />
              <span>Used yet?</span>
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(i)}
              className="text-destructive"
            >
              <Trash2Icon className="size-4" />
              Remove
            </Button>
          </div>
        </div>
      ))}
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={add}
        >
          <PlusIcon className="size-4" />
          Add Resource
        </Button>
      </div>
    </div>
  );
}
