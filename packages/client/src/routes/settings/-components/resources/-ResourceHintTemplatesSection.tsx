import type { HintTemplate } from "@emstack/types";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchSettings, updateSettings, uuidv4 } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

/** The name/group-hint/module-hint inputs shared by the add form and edit row. */
function HintTemplateFields({
  name,
  groupHint,
  moduleHint,
  onName,
  onGroupHint,
  onModuleHint,
}: {
  name: string;
  groupHint: string;
  moduleHint: string;
  onName: (value: string) => void;
  onGroupHint: (value: string) => void;
  onModuleHint: (value: string) => void;
}) {
  return (
    <>
      <Input
        value={name}
        onChange={e => onName(e.target.value)}
        placeholder="Template name (e.g. Book)"
      />
      <Input
        value={groupHint}
        onChange={e => onGroupHint(e.target.value)}
        placeholder="Group hint (e.g. Part I: Foundations)"
      />
      <Input
        value={moduleHint}
        onChange={e => onModuleHint(e.target.value)}
        placeholder="Module hint (e.g. Chapter 3: Forms)"
      />
    </>
  );
}

/**
 * Manage reusable hint templates for naming a resource's module hierarchy. Each
 * template holds a Group hint and a Module hint (example/placeholder text); a
 * resource picks one from its Modules tab and the hints show as placeholders in
 * its group/module name fields. Stored as a JSONB array on the singleton
 * settings row, so every save replaces the whole list.
 */
export function ResourceHintTemplatesSection() {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: () => fetchSettings(),
  });
  const templates = settingsQuery.data?.moduleHintTemplates ?? [];

  const [name, setName] = useState("");
  const [groupHint, setGroupHint] = useState("");
  const [moduleHint, setModuleHint] = useState("");

  const saveMutation = useMutation({
    mutationFn: (next: HintTemplate[]) =>
      updateSettings({
        moduleHintTemplates: next,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.detail(),
      });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const next: HintTemplate[] = [
      ...templates,
      {
        id: uuidv4(),
        name: trimmed,
        groupHint: groupHint.trim(),
        moduleHint: moduleHint.trim(),
      },
    ];
    saveMutation.mutate(next, {
      onSuccess: () => {
        setName("");
        setGroupHint("");
        setModuleHint("");
        toast.success("Template added");
      },
    });
  }

  function handleSaveTemplate(updated: HintTemplate) {
    const next = templates.map(t => (t.id === updated.id ? updated : t));
    saveMutation.mutate(next, {
      onSuccess: () => toast.success("Template saved"),
    });
  }

  function handleRemove(id: string) {
    const next = templates.filter(t => t.id !== id);
    saveMutation.mutate(next, {
      onSuccess: () => toast.success("Template removed"),
    });
  }

  const canAdd = name.trim().length > 0;

  return (
    <section className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Hint templates give you example text when naming a resource&apos;s groups
        and modules — without renaming them. Create a template here (e.g. a
        &ldquo;Book&rdquo; with a Group hint of &ldquo;Part I: Foundations&rdquo;
        and a Module hint of &ldquo;Chapter 3&rdquo;), then pick it from a
        resource&apos;s Modules tab to see those hints as placeholders.
      </p>

      {settingsQuery.isPending
        ? (
          <p className="text-sm text-muted-foreground">Loading templates...</p>
        )
        : templates.length > 0
          ? (
            <ul className="flex flex-col gap-2">
              {templates.map(template => (
                <HintTemplateRow
                  key={template.id}
                  template={template}
                  isSaving={saveMutation.isPending}
                  onSave={handleSaveTemplate}
                  onRemove={() => handleRemove(template.id)}
                />
              ))}
            </ul>
          )
          : (
            <p className="text-sm text-muted-foreground">
              No templates yet. Add one below.
            </p>
          )}

      <div
        className="
          flex max-w-xl flex-col gap-2 rounded-md border bg-muted/30 p-3
        "
      >
        <h3 className="text-sm font-medium">Add a template</h3>
        <HintTemplateFields
          name={name}
          groupHint={groupHint}
          moduleHint={moduleHint}
          onName={setName}
          onGroupHint={setGroupHint}
          onModuleHint={setModuleHint}
        />
        <div>
          <Button
            onClick={handleAdd}
            disabled={!canAdd || saveMutation.isPending}
          >
            Add template
          </Button>
        </div>
      </div>
    </section>
  );
}

function HintTemplateRow({
  template,
  isSaving,
  onSave,
  onRemove,
}: {
  template: HintTemplate;
  isSaving: boolean;
  onSave: (updated: HintTemplate) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(template.name);
  const [groupHint, setGroupHint] = useState(template.groupHint);
  const [moduleHint, setModuleHint] = useState(template.moduleHint);

  function startEdit() {
    setName(template.name);
    setGroupHint(template.groupHint);
    setModuleHint(template.moduleHint);
    setEditing(true);
  }

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({
      ...template,
      name: trimmed,
      groupHint: groupHint.trim(),
      moduleHint: moduleHint.trim(),
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <li
        className="
          flex max-w-xl flex-col gap-2 rounded-md border bg-muted/30 p-3
        "
      >
        <HintTemplateFields
          name={name}
          groupHint={groupHint}
          moduleHint={moduleHint}
          onName={setName}
          onGroupHint={setGroupHint}
          onModuleHint={setModuleHint}
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || name.trim().length === 0}
          >
            Save
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li
      className="
        flex max-w-xl items-start justify-between gap-2 rounded-md border px-3
        py-2
      "
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium">{template.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          Group: {template.groupHint || "—"} · Module:{" "}
          {template.moduleHint || "—"}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={startEdit}
          disabled={isSaving}
        >
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRemove}
          disabled={isSaving}
        >
          Remove
        </Button>
      </div>
    </li>
  );
}
