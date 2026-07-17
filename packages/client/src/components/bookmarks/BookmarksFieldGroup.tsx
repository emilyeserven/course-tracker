import type { TaskBookmark } from "@emstack/types";

import { BookmarkPicker } from "./BookmarkPicker";

interface BookmarksFieldGroupProps {
  value: TaskBookmark[];
  onChange: (next: TaskBookmark[]) => void;
}

// The labeled "Bookmarks" form block shared by the task and routine edit
// forms: a field caption over the Simple Bookmarks picker. Callers wrap it in
// their own form.Field so the form wiring stays typed per form instance.
export function BookmarksFieldGroup({
  value,
  onChange,
}: BookmarksFieldGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">Bookmarks</span>
      <BookmarkPicker
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
