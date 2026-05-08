import type { Daily } from "@emstack/types/src";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GraduationCapIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { incrementCourseProgress } from "@/utils";

interface DailyCourseIndicatorProps {
  daily: Daily;
}

export function DailyCourseIndicator({
  daily,
}: DailyCourseIndicatorProps) {
  const queryClient = useQueryClient();
  const course = daily.course;

  const mutation = useMutation({
    mutationFn: (courseId: string) => incrementCourseProgress(courseId),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: ["courses"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["dailies"],
      });
      if (course) {
        await queryClient.invalidateQueries({
          queryKey: ["course", course.id],
        });
      }
      toast.success(
        `Progressed "${course?.name}" to ${result.progressCurrent}${
          result.progressTotal > 0 ? `/${result.progressTotal}` : ""
        }`,
      );
    },
    onError: () => {
      toast.error("Failed to progress course.");
    },
  });

  if (!course) {
    return null;
  }

  const tooltipText = course.progressTotal > 0
    ? `${course.name} (${course.progressCurrent}/${course.progressTotal})`
    : course.name;

  return (
    <span className="inline-flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center text-muted-foreground">
            <GraduationCapIcon className="size-4" />
          </span>
        </TooltipTrigger>
        <TooltipContent>{tooltipText}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(course.id)}
            aria-label={`Progress ${course.name} by 1`}
            className="
              invisible inline-flex size-5 items-center justify-center
              rounded-sm text-muted-foreground
              group-hover:visible
              hover:bg-accent hover:text-accent-foreground
              disabled:opacity-50
            "
          >
            <PlusIcon className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          Progress course by 1
        </TooltipContent>
      </Tooltip>
    </span>
  );
}
