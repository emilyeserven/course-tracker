import type { CourseStatus } from "@emstack/types/src";

import { CheckCircle, PauseCircle, PlayCircle } from "lucide-react";

export function StatusIndicator({
  status,
}: { status: CourseStatus }) {
  return (
    <div>
      {status && status === "inactive" && (
        <PauseCircle size={16} />
      )}
      {status && status === "active" && (
        <PlayCircle size={16} />
      )}
      {status && status === "complete" && (
        <CheckCircle size={16} />
      )}
    </div>
  );
}
