import { useMemo, useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { CopyIcon, Loader2, SparklesIcon } from "lucide-react";
import { toast } from "sonner";

import { Textarea } from "@/components/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createModule, createModuleGroup } from "@/utils/fetchFunctions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceId: string;
  resourceName: string;
  resourceDescription: string | null;
  resourceUrl: string | null;
  providerName: string | null;
  topicNames: string[];
  existingGroupNames: string[];
  existingUngroupedModuleNames: string[];
  onApplied: () => void;
}

interface SuggestedModule {
  name: string;
  description: string | null;
  location: string | null;
  length: string | null;
}

interface SuggestedModuleGroup {
  name: string;
  description: string | null;
  location: string | null;
  modules: SuggestedModule[];
}

interface ModuleSuggestion {
  moduleGroups: SuggestedModuleGroup[];
  ungroupedModules: SuggestedModule[];
  notes: string | null;
}

interface GroupSelection {
  selected: boolean;
  modules: boolean[];
}

interface SelectionState {
  groups: GroupSelection[];
  ungrouped: boolean[];
}

function stripCodeFence(input: string): string {
  const trimmed = input.trim();
  const fenceMatch = trimmed.match(/^```[^\n]*\n([\s\S]*?)\n?```$/);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

function nullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeLength(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase().replace(/[\s-]/g, "_");
  if (!v) return null;
  if (
    v === "extra_short"
    || v === "short"
    || v === "medium"
    || v === "long"
    || v === "extra_long"
  ) {
    return v;
  }
  // Allow integer minutes as a string (e.g. "30")
  const n = Number(v);
  if (Number.isFinite(n) && n > 0 && Number.isInteger(n)) {
    return String(n);
  }
  return null;
}

function parseSuggestion(raw: string): ModuleSuggestion {
  const parsed = JSON.parse(stripCodeFence(raw)) as unknown;
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(
      "Expected a JSON object with moduleGroups, ungroupedModules, and notes.",
    );
  }
  const obj = parsed as Record<string, unknown>;
  const moduleGroupsRaw = Array.isArray(obj.moduleGroups) ? obj.moduleGroups : [];
  const ungroupedRaw = Array.isArray(obj.ungroupedModules)
    ? obj.ungroupedModules
    : [];

  const moduleGroups: SuggestedModuleGroup[] = moduleGroupsRaw
    .map((g) => {
      if (typeof g !== "object" || g === null) return null;
      const group = g as Record<string, unknown>;
      const name = nullableString(group.name);
      if (!name) return null;
      const modulesRaw = Array.isArray(group.modules) ? group.modules : [];
      const modules: SuggestedModule[] = modulesRaw
        .map(m => parseModule(m))
        .filter((m): m is SuggestedModule => m !== null);
      return {
        name,
        description: nullableString(group.description),
        // Accept "location" (preferred) or "url" (back-compat) from the LLM.
        location: nullableString(group.location) ?? nullableString(group.url),
        modules,
      };
    })
    .filter((g): g is SuggestedModuleGroup => g !== null);

  const ungroupedModules: SuggestedModule[] = ungroupedRaw
    .map(m => parseModule(m))
    .filter((m): m is SuggestedModule => m !== null);

  return {
    moduleGroups,
    ungroupedModules,
    notes: nullableString(obj.notes),
  };
}

function parseModule(raw: unknown): SuggestedModule | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  const name = nullableString(obj.name);
  if (!name) return null;
  return {
    name,
    description: nullableString(obj.description),
    location: nullableString(obj.location) ?? nullableString(obj.url),
    length: normalizeLength(obj.length),
  };
}

function buildSelection(suggestion: ModuleSuggestion): SelectionState {
  return {
    groups: suggestion.moduleGroups.map(g => ({
      selected: true,
      modules: g.modules.map(() => true),
    })),
    ungrouped: suggestion.ungroupedModules.map(() => true),
  };
}

function lengthLabel(length: string | null): string {
  if (!length) return "";
  switch (length) {
    case "extra_short":
      return "<5m";
    case "short":
      return "5–15m";
    case "medium":
      return "15–30m";
    case "long":
      return "30m–1h";
    case "extra_long":
      return "1h+";
    default: {
      const n = Number(length);
      if (Number.isFinite(n) && n > 0) return `${n}m`;
      return length;
    }
  }
}

function bulletList(items: string[]): string {
  if (items.length === 0) return "- (none)";
  return items.map(i => `- ${i}`).join("\n");
}

function buildPrompt(args: {
  resourceName: string;
  resourceDescription: string | null;
  resourceUrl: string | null;
  providerName: string | null;
  topicNames: string[];
  existingGroupNames: string[];
  existingUngroupedModuleNames: string[];
  userNotes: string;
}): string {
  const {
    resourceName,
    resourceDescription,
    resourceUrl,
    providerName,
    topicNames,
    existingGroupNames,
    existingUngroupedModuleNames,
    userNotes,
  } = args;
  const label = resourceName.trim() || "(unnamed resource)";
  const description = resourceDescription?.trim() || "(no description provided)";
  const url = resourceUrl?.trim() || "(no URL provided)";
  const provider = providerName?.trim() || "(no provider set)";
  const trimmedNotes = userNotes.trim();
  const additionalDetailsBlock = trimmedNotes
    ? `Additional details / reference material from me:
${trimmedNotes}`
    : `Additional details / reference material from me:
(none — fill in above if I have a real table of contents, page count, edition, or other reference info you should use)`;
  return `I'm tracking my progress through the learning resource "${label}" and want to break it down into a structured outline of module groups and modules I can check off as I go.

Resource info:
- Name: ${label}
- Description: ${description}
- URL: ${url}
- Provider: ${provider}
- Topics: ${topicNames.length > 0 ? topicNames.join(", ") : "(none)"}

Module groups I've already added (do not duplicate):
${bulletList(existingGroupNames)}

Ungrouped modules I've already added (do not duplicate):
${bulletList(existingUngroupedModuleNames)}

Please propose a structured outline. If the resource is one you know well (e.g. a famous book or popular course), use its actual table of contents. Otherwise propose a reasonable generic outline based on the topic and call that out in "notes". If I've pasted reference material or a real table of contents at the bottom of this prompt, prefer that over anything you'd otherwise guess. Aim for 3-8 module groups with 3-10 modules each for a typical course; fewer (or all ungrouped) is fine for shorter resources.

Return ONLY a JSON object with this exact shape (no commentary, no other keys):

{
  "moduleGroups": [
    {
      "name": "Section / chapter / unit name",
      "description": "Short one-sentence description, or null",
      "location": "Where to find this group inside the resource. Use whatever shape fits the resource type: a URL for online content, a page-number range like \\"pp. 23-67\\" for a book, a timestamp range like \\"00:12:30-00:34:15\\" for a video, or null if not applicable.",
      "modules": [
        {
          "name": "Module / lesson / chapter name",
          "description": "Short one-sentence description, or null",
          "location": "Where to find this module — URL, page-number range for a book chapter, timestamp range for a video lesson, or null.",
          "length": "Either an integer string of minutes (\\"30\\"), or one of: \\"extra_short\\" (<5m), \\"short\\" (5-15m), \\"medium\\" (15-30m), \\"long\\" (30m-1h), \\"extra_long\\" (1h+). Use null if unknown."
        }
      ]
    }
  ],
  "ungroupedModules": [
    {
      "name": "Standalone module name",
      "description": "...",
      "location": "...",
      "length": "..."
    }
  ],
  "notes": "Any brief caveats — e.g. 'best-effort outline; I am not familiar with this specific resource'. Use null when no caveat applies."
}

Leave location null unless you're confident. For a book, prefer page numbers ("pp. 23-67") over made-up URLs. Use empty arrays for moduleGroups or ungroupedModules if you have nothing to suggest in that bucket.

${additionalDetailsBlock}
`;
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    }
    catch {
      // fall through
    }
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  }
  catch {
    return false;
  }
}

export function ModuleSuggestDialog({
  open,
  onOpenChange,
  resourceId,
  resourceName,
  resourceDescription,
  resourceUrl,
  providerName,
  topicNames,
  existingGroupNames,
  existingUngroupedModuleNames,
  onApplied,
}: Props) {
  const [notes, setNotes] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<ModuleSuggestion | null>(null);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  const prompt = useMemo(
    () =>
      buildPrompt({
        resourceName,
        resourceDescription,
        resourceUrl,
        providerName,
        topicNames,
        existingGroupNames,
        existingUngroupedModuleNames,
        userNotes: notes,
      }),
    [
      resourceName,
      resourceDescription,
      resourceUrl,
      providerName,
      topicNames,
      existingGroupNames,
      existingUngroupedModuleNames,
      notes,
    ],
  );

  function reset() {
    setNotes("");
    setJsonText("");
    setParseError(null);
    setSuggestion(null);
    setSelection(null);
    setApplyError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function copyPrompt() {
    const ok = await copyToClipboard(prompt);
    if (ok) {
      toast.success("Prompt copied to clipboard.");
    }
    else {
      toast.error("Couldn't copy — please select and copy manually.");
    }
  }

  function parseAndReview() {
    setParseError(null);
    setApplyError(null);
    if (!jsonText.trim()) {
      setParseError("Paste the LLM's JSON response above.");
      return;
    }
    try {
      const parsed = parseSuggestion(jsonText);
      if (
        parsed.moduleGroups.length === 0
        && parsed.ungroupedModules.length === 0
      ) {
        setParseError(
          "The response had no module groups or modules. Double-check the JSON.",
        );
        return;
      }
      setSuggestion(parsed);
      setSelection(buildSelection(parsed));
    }
    catch (err) {
      setParseError(err instanceof Error ? err.message : String(err));
    }
  }

  const totalSelected = useMemo(() => {
    if (!selection) {
      return {
        groups: 0,
        modules: 0,
      };
    }
    let groupCount = 0;
    let moduleCount = 0;
    for (const g of selection.groups) {
      if (g.selected) groupCount += 1;
      moduleCount += g.modules.filter(Boolean).length;
    }
    moduleCount += selection.ungrouped.filter(Boolean).length;
    return {
      groups: groupCount,
      modules: moduleCount,
    };
  }, [selection]);

  const apply = useMutation({
    mutationFn: async () => {
      if (!suggestion || !selection) {
        throw new Error("No suggestion to apply");
      }
      let groupsCreated = 0;
      let modulesCreated = 0;
      const errors: string[] = [];

      for (let gi = 0; gi < suggestion.moduleGroups.length; gi++) {
        const g = suggestion.moduleGroups[gi];
        const sel = selection.groups[gi];
        if (!sel) continue;
        const wantsGroup = sel.selected;
        const selectedModules = g.modules.filter((_, mi) => sel.modules[mi]);
        if (!wantsGroup && selectedModules.length === 0) continue;

        let groupId: string | null = null;
        if (wantsGroup) {
          try {
            const result = await createModuleGroup(groupPayload(resourceId, g));
            groupId = result.id;
            groupsCreated += 1;
          }
          catch (err) {
            errors.push(
              `Failed to create group "${g.name}": ${err instanceof Error ? err.message : String(err)}`,
            );
            continue;
          }
        }

        for (const m of selectedModules) {
          try {
            await createModule(modulePayload(resourceId, m, groupId));
            modulesCreated += 1;
          }
          catch (err) {
            errors.push(
              `Failed to create module "${m.name}": ${err instanceof Error ? err.message : String(err)}`,
            );
          }
        }
      }

      for (let mi = 0; mi < suggestion.ungroupedModules.length; mi++) {
        if (!selection.ungrouped[mi]) continue;
        const m = suggestion.ungroupedModules[mi];
        try {
          await createModule(modulePayload(resourceId, m, null));
          modulesCreated += 1;
        }
        catch (err) {
          errors.push(
            `Failed to create module "${m.name}": ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }

      return {
        groupsCreated,
        modulesCreated,
        errors,
      };
    },
    onSuccess: ({
      groupsCreated, modulesCreated, errors,
    }) => {
      if (errors.length > 0) {
        setApplyError(errors.join("\n"));
        if (groupsCreated > 0 || modulesCreated > 0) {
          toast.warning(
            `Created ${groupsCreated} group(s) and ${modulesCreated} module(s); ${errors.length} failed.`,
          );
          onApplied();
        }
        else {
          toast.error("Failed to create any modules — see details below.");
        }
        return;
      }
      toast.success(
        `Created ${groupsCreated} group(s) and ${modulesCreated} module(s).`,
      );
      onApplied();
      handleOpenChange(false);
    },
    onError: (e: Error) => {
      setApplyError(e.message);
    },
  });

  function toggleGroupSelected(gi: number) {
    setSelection((prev) => {
      if (!prev) return prev;
      const groups = prev.groups.slice();
      groups[gi] = {
        ...groups[gi],
        selected: !groups[gi].selected,
      };
      return {
        ...prev,
        groups,
      };
    });
  }

  function toggleGroupModule(gi: number, mi: number) {
    setSelection((prev) => {
      if (!prev) return prev;
      const groups = prev.groups.slice();
      const modules = groups[gi].modules.slice();
      modules[mi] = !modules[mi];
      groups[gi] = {
        ...groups[gi],
        modules,
      };
      return {
        ...prev,
        groups,
      };
    });
  }

  function toggleUngrouped(mi: number) {
    setSelection((prev) => {
      if (!prev) return prev;
      const ungrouped = prev.ungrouped.slice();
      ungrouped[mi] = !ungrouped[mi];
      return {
        ...prev,
        ungrouped,
      };
    });
  }

  function selectAll(value: boolean) {
    setSelection((prev) => {
      if (!prev) return prev;
      return {
        groups: prev.groups.map(g => ({
          selected: value,
          modules: g.modules.map(() => value),
        })),
        ungrouped: prev.ungrouped.map(() => value),
      };
    });
  }

  function backToSetup() {
    setSuggestion(null);
    setSelection(null);
    setApplyError(null);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent
        className="max-h-[90vh] max-w-3xl overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SparklesIcon className="size-4" />
            {`LLM Assist — Modules for "${resourceName}"`}
          </DialogTitle>
          <DialogDescription>
            Copy the prompt below into any LLM, paste its JSON response back
            here, then review and pick which suggestions to add.
          </DialogDescription>
        </DialogHeader>

        {!suggestion && (
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">
                Additional details / reference material (optional)
              </span>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Paste an actual table of contents, list the chapters, give the page count or video length, name the edition, mention which sections to focus on, etc. Anything you put here goes at the END of the prompt — the LLM is told to prefer it over guesses."
                rows={4}
              />
              <span className="text-xs text-muted-foreground">
                For books, asking for page-number ranges as the location is
                usually more useful than URLs.
              </span>
            </label>

            <div className="flex flex-col gap-1">
              <div className="flex flex-row items-center justify-between">
                <span className="text-sm font-medium">Prompt</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyPrompt}
                >
                  <CopyIcon className="size-3.5" />
                  Copy prompt
                </Button>
              </div>
              <pre
                className={`
                  h-56 overflow-auto rounded-sm bg-muted p-3 text-xs
                  whitespace-pre-wrap
                `}
              >
                {prompt}
              </pre>
            </div>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">JSON response</span>
              <Textarea
                value={jsonText}
                onChange={e => setJsonText(e.target.value)}
                placeholder='{"moduleGroups": [...], "ungroupedModules": [...], "notes": null}'
                className="h-40 font-mono text-xs"
              />
              {parseError && (
                <span className="text-xs text-destructive">{parseError}</span>
              )}
            </label>

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                onClick={parseAndReview}
                disabled={!jsonText.trim()}
              >
                Parse and Review
              </Button>
            </DialogFooter>
          </div>
        )}

        {suggestion && selection && (
          <div className="flex flex-col gap-3">
            {suggestion.notes && (
              <p
                className={`
                  rounded-md border border-amber-300 bg-amber-50 p-2 text-xs
                  text-amber-900
                  dark:border-amber-700/60 dark:bg-amber-900/30
                  dark:text-amber-200
                `}
              >
                {suggestion.notes}
              </p>
            )}

            <div className="flex flex-row items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                {totalSelected.groups}
                {" group(s) and "}
                {totalSelected.modules}
                {" module(s) selected"}
              </p>
              <div className="flex flex-row gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => selectAll(true)}
                >
                  Select all
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => selectAll(false)}
                >
                  Clear
                </Button>
              </div>
            </div>

            {suggestion.moduleGroups.map((g, gi) => (
              <SuggestionGroupCard
                key={`g-${gi}`}
                group={g}
                groupSelected={selection.groups[gi].selected}
                modulesSelected={selection.groups[gi].modules}
                onToggleGroup={() => toggleGroupSelected(gi)}
                onToggleModule={mi => toggleGroupModule(gi, mi)}
              />
            ))}

            {suggestion.ungroupedModules.length > 0 && (
              <div
                className="
                  flex flex-col gap-2 rounded-md border bg-background p-3
                "
              >
                <h3 className="text-sm font-medium">Ungrouped modules</h3>
                <ul className="flex flex-col divide-y rounded-sm border">
                  {suggestion.ungroupedModules.map((m, mi) => (
                    <ModuleRow
                      key={`u-${mi}`}
                      module={m}
                      checked={selection.ungrouped[mi]}
                      onToggle={() => toggleUngrouped(mi)}
                    />
                  ))}
                </ul>
              </div>
            )}

            {applyError && (
              <pre
                className={`
                  max-h-32 overflow-auto rounded-md border border-destructive
                  bg-destructive/10 p-2 text-xs whitespace-pre-wrap
                  text-destructive
                `}
              >
                {applyError}
              </pre>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={backToSetup}
                disabled={apply.isPending}
              >
                Back
              </Button>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={apply.isPending}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                onClick={() => {
                  setApplyError(null);
                  apply.mutate();
                }}
                disabled={
                  apply.isPending
                  || (totalSelected.groups === 0 && totalSelected.modules === 0)
                }
              >
                {apply.isPending && <Loader2 className="animate-spin" />}
                Add Selected
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function groupPayload(
  resourceId: string,
  g: SuggestedModuleGroup,
): Record<string, unknown> {
  return {
    resourceId,
    name: g.name,
    description: g.description ?? null,
    // The DB column is `url` but the LLM is asked for "location" (URL, page
    // range, video timestamp, etc.). Store the location string in `url` —
    // the existing UI falls back to plain text when it isn't an http URL.
    url: g.location ?? null,
    totalCount: null,
    completedCount: null,
    easeOfStarting: null,
    timeNeeded: null,
    interactivity: null,
    tagIds: [],
  };
}

function modulePayload(
  resourceId: string,
  m: SuggestedModule,
  moduleGroupId: string | null,
): Record<string, unknown> {
  return {
    resourceId,
    moduleGroupId,
    name: m.name,
    description: m.description ?? null,
    url: m.location ?? null,
    length: m.length ?? null,
    isComplete: false,
    easeOfStarting: null,
    timeNeeded: null,
    interactivity: null,
    tagIds: [],
  };
}

function SuggestionGroupCard({
  group,
  groupSelected,
  modulesSelected,
  onToggleGroup,
  onToggleModule,
}: {
  group: SuggestedModuleGroup;
  groupSelected: boolean;
  modulesSelected: boolean[];
  onToggleGroup: () => void;
  onToggleModule: (mi: number) => void;
}) {
  return (
    <div
      className="flex flex-col gap-2 rounded-md border bg-background p-3"
    >
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={groupSelected}
          onChange={onToggleGroup}
          className="mt-1 size-4"
        />
        <span className="flex flex-col gap-0.5">
          <span className="font-medium">{group.name}</span>
          {group.description && (
            <span className="text-xs text-muted-foreground">
              {group.description}
            </span>
          )}
          {!groupSelected && (
            <span className="text-xs text-muted-foreground italic">
              Group skipped — selected modules below will be created without
              this group.
            </span>
          )}
        </span>
      </label>
      {group.modules.length > 0 && (
        <ul className="flex flex-col divide-y rounded-sm border">
          {group.modules.map((m, mi) => (
            <ModuleRow
              key={`m-${mi}`}
              module={m}
              checked={modulesSelected[mi]}
              onToggle={() => onToggleModule(mi)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ModuleRow({
  module: m,
  checked,
  onToggle,
}: {
  module: SuggestedModule;
  checked: boolean;
  onToggle: () => void;
}) {
  const length = lengthLabel(m.length);
  return (
    <li className="flex items-start gap-2 px-2 py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="mt-1 size-4"
      />
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-sm">
          {m.name}
          {length && (
            <span className="ml-2 text-xs text-muted-foreground">
              {length}
            </span>
          )}
        </span>
        {m.description && (
          <span className="text-xs text-muted-foreground">{m.description}</span>
        )}
      </span>
    </li>
  );
}
