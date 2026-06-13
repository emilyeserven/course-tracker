import type { Daily } from "@emstack/types";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GraduationCapIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { DailyEntityLink } from "./DailyEntityLink";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { dailyLinkTooltip, incrementResourceProgress } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

interface DailyResourceIndicatorProps {
  daily: Daily;
}

export function DailyResourceIndicator({
  daily,
}: DailyResourceIndicatorProps) {
  const queryClient = useQueryClient();
  const course = daily.resource;

  const mutation = useMutation({
    mutationFn: (courseId: string) => incrementResourceProgress(courseId),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.resources.list(),
      });
      await queryClient.invalidateQueries({
        queryKey: ["dailies"],
      });
      if (course) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.resources.detail(course.id),
        });
      }
      toast.success(
        `Progressed "${course?.name}" to ${result.progressCurrent}${
          result.progressTotal > 0 ? `/${result.progressTotal}` : ""
        }`,
      );
    },
    onError: () => {
      toast.error("Failed to progress resource.");
    },
  });

  if (!course) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1">
      <DailyEntityLink
        entity="resources"
        id={course.id}
        icon={<GraduationCapIcon className="size-4" />}
        tooltip={dailyLinkTooltip(course.name, daily.name, "Go to Course")}
        ariaLabel={`Go to course ${course.name}`}
      />
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
        <TooltipContent>Progress course by 1</TooltipContent>
      </Tooltip>
    </span>
  );
}
