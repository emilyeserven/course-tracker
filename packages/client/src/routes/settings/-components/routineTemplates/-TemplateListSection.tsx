import type { ReactNode } from "react";

import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface TemplateListSectionProps<T extends { id: string;
  label: string; }> {
  title: string;
  description: string;
  templates: T[];
  isPending: boolean;
  // The optional second line under a template's label.
  renderMeta: (template: T) => ReactNode;
  onNew: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

// The template settings sections' shared list shell: heading + New button,
// blurb, and the pending / empty / list states with per-row Edit and Delete.
// Shared by the routine-template and criteria-template sections.
export function TemplateListSection<T extends { id: string;
  label: string; }>({
  title,
  description,
  templates,
  isPending,
  renderMeta,
  onNew,
  onEdit,
  onDelete,
  isDeleting,
}: TemplateListSectionProps<T>) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button
          variant="outline"
          onClick={onNew}
        >
          <PlusIcon />
          New Template
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      {isPending
        ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )
        : templates.length === 0
          ? (
            <p className="text-sm text-muted-foreground">
              No templates yet. Create one to use it as a Quick Fill option.
            </p>
          )
          : (
            <ul className="flex flex-col divide-y rounded-md border">
              {templates.map(t => (
                <li
                  key={t.id}
                  className="
                    flex flex-wrap items-center justify-between gap-2 p-3
                  "
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{t.label}</span>
                    {renderMeta(t)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(t.id)}
                    >
                      <PencilIcon className="size-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(t.id)}
                      disabled={isDeleting}
                    >
                      <Trash2Icon className="size-4" />
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
    </section>
  );
}
