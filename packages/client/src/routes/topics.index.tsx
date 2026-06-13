import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { TopicsList } from "./topics.-components/-TopicsList";

import {
  EntityError,
  EntityPending,
  PageHeader,
} from "@/components/listControls";
import { ENTITY_DESCRIPTIONS } from "@/lib/entityDescriptions";
import { bulkDeleteTopics, fetchDomains, fetchTopics } from "@/utils";

export const Route = createFileRoute("/topics/")({
  component: Topics,
  errorComponent: TopicsError,
  pendingComponent: TopicsPending,
});

function TopicsPending() {
  return <EntityPending entity="topics" />;
}

function TopicsError() {
  return <EntityError entity="topics" />;
}

function Topics() {
  const queryClient = useQueryClient();

  const {
    data: topics,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: () => fetchTopics(),
  });

  const {
    data: domains,
  } = useQuery({
    queryKey: ["domains"],
    queryFn: () => fetchDomains(),
  });

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await bulkDeleteTopics(ids);
      await queryClient.invalidateQueries({
        queryKey: ["topics"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["domains"],
      });
      toast.success(
        ids.length === 1 ? "1 topic deleted." : `${ids.length} topics deleted.`,
      );
    }
    catch (error) {
      toast.error("Failed to delete topics. Please try again.");
      throw error;
    }
  };

  return (
    <div>
      <PageHeader
        pageTitle="Topics"
        pageSection=""
        description={ENTITY_DESCRIPTIONS.topics}
      />
      <TopicsList
        topics={topics ?? []}
        domains={domains ?? []}
        onBulkDelete={handleBulkDelete}
      />
    </div>
  );
}
