import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EyeIcon } from "lucide-react";

import { DailyForm } from "@/components/dailies";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useRedirectLinkedDaily } from "@/hooks/useRedirectLinkedDaily";
import { fetchSingleDaily } from "@/utils";

interface DailyEditSearch {
  newCourseId?: string;
  topicId?: string;
}

export const Route = createFileRoute("/dailies/$id/edit")({
  component: SingleDailyEdit,
  validateSearch: (search: Record<string, unknown>): DailyEditSearch => ({
    newCourseId:
      typeof search.newCourseId === "string" && search.newCourseId
        ? search.newCourseId
        : undefined,
    topicId:
      typeof search.topicId === "string" && search.topicId
        ? search.topicId
        : undefined,
  }),
});

function SingleDailyEdit() {
  const {
    id,
  } = Route.useParams();
  const search = Route.useSearch();
  const isNew = id === "new";
  const navigate = useNavigate();

  const {
    data,
  } = useQuery({
    queryKey: ["daily", id],
    queryFn: () => fetchSingleDaily(id),
    enabled: !isNew,
  });

  // If this daily already belongs to a Task or Resource, edit happens there.
  const isRedirecting = useRedirectLinkedDaily({
    daily: isNew ? null : data,
    mode: "edit",
  });

  if (isRedirecting) {
    return null;
  }

  return (
    <div>
      <PageHeader
        pageTitle={isNew ? "New Daily" : "Edit Daily"}
        pageSection="dailies"
      >
        {!isNew && (
          <Link
            to="/dailies/$id"
            params={{
              id,
            }}
          >
            <Button variant="secondary">
              View Daily
              {" "}
              <EyeIcon />
            </Button>
          </Link>
        )}
      </PageHeader>
      <div className="m-auto w-full max-w-[1200px] px-4">
        <DailyForm
          id={id}
          isNew={isNew}
          prefillTopicId={search.topicId}
          prefillResourceId={search.newCourseId}
          onSaved={async ({
            id: dailyId, taskId, resourceId,
          }) => {
            // If the user picked a Task/Resource during edit, take them there
            // so they see the daily in its new home.
            if (taskId) {
              await navigate({
                to: "/tasks/$id",
                params: {
                  id: taskId,
                },
                search: {
                  dailySection: dailyId,
                  dailyMode: "view",
                },
              });
              return;
            }
            if (resourceId) {
              await navigate({
                to: "/resources/$id",
                params: {
                  id: resourceId,
                },
                search: {
                  dailySection: dailyId,
                  dailyMode: "view",
                },
              });
              return;
            }
            await navigate({
              to: "/dailies/$id",
              params: {
                id: dailyId,
              },
            });
          }}
          onCancel={async () => {
            if (isNew) {
              await navigate({
                to: "/dailies",
              });
            }
            else {
              await navigate({
                to: "/dailies/$id",
                params: {
                  id,
                },
              });
            }
          }}
          onDeleted={async () => {
            await navigate({
              to: "/dailies",
            });
          }}
          onDuplicated={async (newId) => {
            await navigate({
              to: "/dailies/$id",
              params: {
                id: newId,
              },
            });
          }}
        />
      </div>
    </div>
  );
}
