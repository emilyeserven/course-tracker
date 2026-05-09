import type { Module, ModuleGroup } from "@emstack/types/src";

import { useMemo } from "react";

import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface ResourceLinkInput {
  courseId: string;
  moduleGroupId: string | null;
  moduleId: string | null;
}

interface CourseSummary {
  id: string;
  name: string;
}

interface ResourceLinksPickerProps {
  value: ResourceLinkInput[];
  onChange: (next: ResourceLinkInput[]) => void;
  courses: CourseSummary[];
  moduleGroups: ModuleGroup[];
  modules: Module[];
}

interface LinkOption {
  key: string;
  label: string;
  courseId: string;
  moduleGroupId: string | null;
  moduleId: string | null;
}

function buildOptions(
  courses: CourseSummary[],
  groups: ModuleGroup[],
  modules: Module[],
): LinkOption[] {
  const opts: LinkOption[] = [];
  for (const c of courses) {
    opts.push({
      key: `c:${c.id}`,
      label: c.name,
      courseId: c.id,
      moduleGroupId: null,
      moduleId: null,
    });
    const courseGroups = groups.filter(g => g.courseId === c.id);
    for (const g of courseGroups) {
      opts.push({
        key: `g:${g.id}`,
        label: `${c.name} → ${g.name}`,
        courseId: c.id,
        moduleGroupId: g.id,
        moduleId: null,
      });
    }
    const courseModules = modules.filter(m => m.courseId === c.id);
    for (const m of courseModules) {
      const parentGroup = m.moduleGroupId
        ? groups.find(g => g.id === m.moduleGroupId)
        : null;
      const label = parentGroup
        ? `${c.name} → ${parentGroup.name} → ${m.name}`
        : `${c.name} → ${m.name}`;
      opts.push({
        key: `m:${m.id}`,
        label,
        courseId: c.id,
        moduleGroupId: null,
        moduleId: m.id,
      });
    }
  }
  return opts;
}

function labelForLink(
  link: ResourceLinkInput,
  courses: CourseSummary[],
  groups: ModuleGroup[],
  modules: Module[],
): string {
  const course = courses.find(c => c.id === link.courseId);
  const courseName = course?.name ?? "(unknown resource)";
  if (link.moduleId) {
    const m = modules.find(mm => mm.id === link.moduleId);
    const parentGroup = m?.moduleGroupId
      ? groups.find(g => g.id === m.moduleGroupId)
      : null;
    if (parentGroup) {
      return `${courseName} → ${parentGroup.name} → ${m?.name ?? "(unknown module)"}`;
    }
    return `${courseName} → ${m?.name ?? "(unknown module)"}`;
  }
  if (link.moduleGroupId) {
    const g = groups.find(gg => gg.id === link.moduleGroupId);
    return `${courseName} → ${g?.name ?? "(unknown group)"}`;
  }
  return courseName;
}

export function ResourceLinksPicker({
  value,
  onChange,
  courses,
  moduleGroups,
  modules,
}: ResourceLinksPickerProps) {
  const allOptions = useMemo(
    () => buildOptions(courses, moduleGroups, modules),
    [courses, moduleGroups, modules],
  );

  const linkedCourseIds = new Set(value.map(v => v.courseId));

  // Hide options for courses already linked: PK is (taskId, courseId), one
  // link per course. To change a course's sub-target, remove and re-add.
  const availableOptions = allOptions.filter(
    opt => !linkedCourseIds.has(opt.courseId),
  );

  function handleAdd(key: string) {
    if (!key) return;
    const opt = allOptions.find(o => o.key === key);
    if (!opt) return;
    onChange([
      ...value,
      {
        courseId: opt.courseId,
        moduleGroupId: opt.moduleGroupId,
        moduleId: opt.moduleId,
      },
    ]);
  }

  function handleRemove(courseId: string) {
    onChange(value.filter(v => v.courseId !== courseId));
  }

  return (
    <div className="flex flex-col gap-2">
      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No resource links. Pick a course or sub-target below to add one.
        </p>
      )}
      {value.length > 0 && (
        <ul className="flex flex-col divide-y rounded-md border bg-background">
          {value.map(link => (
            <li
              key={link.courseId}
              className="flex items-center justify-between gap-2 px-3 py-2"
            >
              <span className="text-sm">
                {labelForLink(link, courses, moduleGroups, modules)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleRemove(link.courseId)}
                aria-label="Remove link"
              >
                <XIcon className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <select
        value=""
        onChange={(e) => {
          handleAdd(e.target.value);
          e.target.value = "";
        }}
        className="
          flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm
          shadow-sm transition-colors
          focus-visible:ring-1 focus-visible:ring-ring
          focus-visible:outline-none
          disabled:cursor-not-allowed disabled:opacity-50
        "
        disabled={availableOptions.length === 0}
      >
        <option value="">
          {availableOptions.length === 0
            ? courses.length === 0
              ? "No resources available"
              : "All resources already linked"
            : "Add a resource link..."}
        </option>
        {availableOptions.map(opt => (
          <option
            key={opt.key}
            value={opt.key}
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
