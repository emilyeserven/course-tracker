import { createFileRoute } from "@tanstack/react-router";

import { TopicForm } from "./-components/-TopicForm";

export const Route = createFileRoute("/topics/$id/edit")({
  component: SingleTopicEdit,
});

function SingleTopicEdit() {
  const {
    id,
  } = Route.useParams();
  const isNew = id === "new";

  return (
    <TopicForm
      id={id}
      isNew={isNew}
    />
  );
}
