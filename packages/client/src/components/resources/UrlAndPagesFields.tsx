import type { UrlAndPagesValue } from "./moduleDrafts";

import { Input } from "@/components/ui/input";

/**
 * The shared "location/URL + page range" fields rendered near the top of the
 * module and module-group edit cards. Both cards back these onto a draft with
 * the same shape, so they share this block. The page-range grid only shows for
 * book resources (showPages); otherwise the single field is a generic location.
 */
export function UrlAndPagesFields({
  draft,
  showPages = false,
  onChange,
}: {
  draft: UrlAndPagesValue;
  /** When true (book resources), show start/end page inputs. */
  showPages?: boolean;
  onChange: (patch: Partial<UrlAndPagesValue>) => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          {showPages ? "URL (optional)" : "Location (optional)"}
        </label>
        <Input
          type="text"
          value={draft.url}
          onChange={e =>
            onChange({
              url: e.target.value,
            })}
        />
      </div>
      {showPages && (
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Start page (optional)
            </label>
            <Input
              type="number"
              min={0}
              step={1}
              value={draft.pageStart}
              onChange={e =>
                onChange({
                  pageStart: e.target.value,
                })}
              placeholder="e.g. 42"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              End page (optional)
            </label>
            <Input
              type="number"
              min={0}
              step={1}
              value={draft.pageEnd}
              onChange={e =>
                onChange({
                  pageEnd: e.target.value,
                })}
              placeholder="e.g. 58"
            />
          </div>
        </div>
      )}
    </>
  );
}
