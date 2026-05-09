import type { TopicForTopicsPage } from "@emstack/types/src";

import { Loader2 } from "lucide-react";

import { TopicMultiSelect } from "@/components/radar/TopicMultiSelect";
import { Textarea } from "@/components/textarea";
import { Button } from "@/components/ui/button";

interface ScopeTabProps {
  topics: TopicForTopicsPage[];
  withinScopeDescription: string;
  outOfScopeDescription: string;
  withinScopeTopicIds: string[];
  outOfScopeTopicIds: string[];
  onChangeWithinScopeDescription: (v: string) => void;
  onChangeOutOfScopeDescription: (v: string) => void;
  onChangeWithinScopeTopicIds: (ids: string[]) => void;
  onChangeOutOfScopeTopicIds: (ids: string[]) => void;
  onSave: () => void;
  isSaving: boolean;
  canSave: boolean;
}

export function ScopeTab({
  topics,
  withinScopeDescription,
  outOfScopeDescription,
  withinScopeTopicIds,
  outOfScopeTopicIds,
  onChangeWithinScopeDescription,
  onChangeOutOfScopeDescription,
  onChangeWithinScopeTopicIds,
  onChangeOutOfScopeTopicIds,
  onSave,
  isSaving,
  canSave,
}: ScopeTabProps) {
  return (
    <section className="flex flex-col gap-6">
      <div
        className={`
          grid grid-cols-1 gap-6
          md:grid-cols-2
        `}
      >
        <div className="flex flex-col gap-3 rounded-md border p-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-semibold">Within Scope</h3>
            <p className="text-sm text-muted-foreground">
              Used to nudge the LLM toward topics that fit this radar&apos;s
              focus.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase">Description</label>
            <Textarea
              value={withinScopeDescription}
              onChange={e => onChangeWithinScopeDescription(e.target.value)}
              placeholder="What kinds of topics belong on this radar?"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase">Topics</label>
            <TopicMultiSelect
              options={topics
                .filter(t => !outOfScopeTopicIds.includes(t.id))
                .map(t => ({
                  value: t.id,
                  label: t.name,
                }))}
              value={withinScopeTopicIds}
              onChange={onChangeWithinScopeTopicIds}
              placeholder="Add topics in scope..."
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-md border p-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-semibold">Out of Scope</h3>
            <p className="text-sm text-muted-foreground">
              Used to nudge the LLM away from topics that don&apos;t fit this
              radar.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase">Description</label>
            <Textarea
              value={outOfScopeDescription}
              onChange={e => onChangeOutOfScopeDescription(e.target.value)}
              placeholder="What kinds of topics should be avoided?"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase">Topics</label>
            <TopicMultiSelect
              options={topics
                .filter(t => !withinScopeTopicIds.includes(t.id))
                .map(t => ({
                  value: t.id,
                  label: t.name,
                }))}
              value={outOfScopeTopicIds}
              onChange={onChangeOutOfScopeTopicIds}
              placeholder="Add topics out of scope..."
            />
          </div>
        </div>
      </div>
      <div>
        <Button
          type="button"
          onClick={onSave}
          disabled={isSaving || !canSave}
        >
          {isSaving && <Loader2 className="animate-spin" />}
          Save Details
        </Button>
      </div>
    </section>
  );
}
