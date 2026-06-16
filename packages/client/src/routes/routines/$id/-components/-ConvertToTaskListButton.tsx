import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ListChecksIcon } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { convertRoutineToTaskList } from "@/utils";

// Converts a curated routine into a Task List, then navigates to the new list.
// The source routine is archived (status set to inactive) server-side. Rendered
// only for curated routines as part of phasing curated routines out.
export function ConvertToTaskListButton({
  routineId,
}: { routineId: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: () => convertRoutineToTaskList(routineId),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["routine", routineId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["routines"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["tasks"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dailies"],
        }),
      ]);
      toast.success("Converted to a Task List.");
      navigate({
        to: "/tasks/$id",
        params: {
          id: result.id,
        },
      });
    },
    onError: () => {
      toast.error("Failed to convert routine.");
    },
  });

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        disabled={mutation.isPending}
      >
        Convert to Task List
        {" "}
        <ListChecksIcon />
      </Button>
      <ConfirmDialog
        open={open}
        title="Convert to a Task List?"
        description={
          "Each scheduled day becomes a to-do with its due date and status. "
          + "The original routine is archived (set to inactive). "
          + "Entries pointing at a task become plain to-dos."
        }
        confirmLabel="Convert"
        cancelLabel="Cancel"
        onConfirm={() => {
          setOpen(false);
          mutation.mutate();
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
