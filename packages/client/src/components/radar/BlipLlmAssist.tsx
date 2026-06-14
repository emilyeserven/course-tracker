import type { UseBlipLlmAssistArgs } from "@/hooks/useBlipLlmAssist";

import { CopyIcon, Loader2 } from "lucide-react";

import { BulkEditBar } from "./BlipLlmBulkEditBar";
import { ReviewTable } from "./BlipLlmReviewTable";

import { Textarea } from "@/components/textarea";
import { Button } from "@/components/ui/button";
import { useBlipLlmAssist } from "@/hooks/useBlipLlmAssist";

export type BlipLlmAssistProps = UseBlipLlmAssistArgs;

export function BlipLlmAssist(props: BlipLlmAssistProps) {
  const {
    quadrants, rings,
  } = props;
  const {
    mode,
    setMode,
    prompt,
    unassignedCount,
    jsonText,
    setJsonText,
    parseError,
    isSubmitting,
    quadrantById,
    ringById,
    topicById,
    counts,
    actionableCount,
    copyPrompt,
    parseAndResolve,
    handleConfirm,
    resolved,
    setResolved,
    updateEntry,
    startEdit,
    commitEdit,
    cancelEdit,
    updateDraft,
    setRowSelected,
    setAllSelected,
    bulkSetQuadrant,
    bulkSetRing,
    bulkSetResolution,
    bulkClearDescriptions,
    bulkClearRadarNotes,
  } = useBlipLlmAssist(props);

  return (
    <div className="flex flex-col gap-4 rounded-sm border p-4">
      {!resolved && (
        <>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Prompt mode</span>
            <div className="flex flex-row flex-wrap gap-4">
              <label className="flex flex-row items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="llm-prompt-mode"
                  value="setup"
                  checked={mode === "setup"}
                  onChange={() => setMode("setup")}
                />
                Setup / Update — propose new and updated blips
              </label>
              <label className="flex flex-row items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="llm-prompt-mode"
                  value="cleanup"
                  checked={mode === "cleanup"}
                  onChange={() => setMode("cleanup")}
                  disabled={unassignedCount === 0}
                />
                Clean up — assign slice/ring to unassigned blips (
                {unassignedCount}
                )
              </label>
            </div>
          </div>
          <div
            className={`
              grid grid-cols-1 gap-4
              md:grid-cols-2
            `}
          >
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center justify-between">
                <label className="text-sm font-medium">Prompt</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyPrompt}
                >
                  <CopyIcon />
                  {" "}
                  Copy prompt
                </Button>
              </div>
              <pre
                className={`
                  h-96 overflow-auto rounded-sm bg-muted p-3 text-xs
                  whitespace-pre-wrap
                `}
              >
                {prompt}
              </pre>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">JSON response</label>
              <Textarea
                value={jsonText}
                onChange={e => setJsonText(e.target.value)}
                placeholder='[{ "topic": "...", "action": "add | update | remove", "description": "...", "radarNote": "...", "quadrant": "...", "ring": "..." }]'
                className="h-96 font-mono text-xs"
              />
              {parseError && (
                <p className="text-sm text-destructive">{parseError}</p>
              )}
            </div>
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={parseAndResolve}
            disabled={!jsonText.trim()}
          >
            Parse and Review
          </Button>
        </>
      )}

      {resolved && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            {counts.create}
            {" "}
            to add ·
            {" "}
            {counts.overwriteAll}
            {" "}
            to overwrite ·
            {" "}
            {counts.updateBlip}
            {" "}
            to update ·
            {" "}
            {counts.removeBlip}
            {" "}
            to remove ·
            {" "}
            {counts.skip}
            {" "}
            to skip ·
            {" "}
            {counts.problem}
            {" "}
            problem
            {counts.problem === 1 ? "" : "s"}
            {" "}
            ·
            {" "}
            {counts.newTopic}
            {" "}
            new topic
            {counts.newTopic === 1 ? "" : "s"}
          </p>

          <BulkEditBar
            resolved={resolved}
            quadrants={quadrants}
            rings={rings}
            onBulkQuadrant={bulkSetQuadrant}
            onBulkRing={bulkSetRing}
            onBulkResolution={bulkSetResolution}
            onClearDescriptions={bulkClearDescriptions}
            onClearRadarNotes={bulkClearRadarNotes}
          />

          <ReviewTable
            resolved={resolved}
            quadrants={quadrants}
            rings={rings}
            quadrantById={quadrantById}
            ringById={ringById}
            topicById={topicById}
            updateEntry={updateEntry}
            startEdit={startEdit}
            commitEdit={commitEdit}
            cancelEdit={cancelEdit}
            updateDraft={updateDraft}
            setRowSelected={setRowSelected}
            setAllSelected={setAllSelected}
          />

          <div className="flex flex-row gap-2">
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting || actionableCount === 0}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              Apply (
              {actionableCount}
              )
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setResolved(null)}
              disabled={isSubmitting}
            >
              Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
