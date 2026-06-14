import { createFileRoute } from "@tanstack/react-router";

import { ExistingDomainEditor } from "./domains.$id.edit.-components/-ExistingDomainEditor";
import { NewDomainForm } from "./domains.$id.edit.-components/details";

const TAB_VALUES = ["details", "scope", "config", "blips", "llm"] as const;
export type EditTab = (typeof TAB_VALUES)[number];

export interface EditSearch {
  tab?: EditTab;
}

export const Route = createFileRoute("/domains/$id/edit")({
  component: SingleDomainEdit,
  validateSearch: (search: Record<string, unknown>): EditSearch => {
    const value = search.tab;
    if (
      typeof value === "string"
      && (TAB_VALUES as readonly string[]).includes(value)
    ) {
      return {
        tab: value as EditTab,
      };
    }
    return {};
  },
});

function SingleDomainEdit() {
  const {
    id,
  } = Route.useParams();
  const search = Route.useSearch();
  const isNew = id === "new";

  if (isNew) {
    return <NewDomainForm />;
  }
  return (
    <ExistingDomainEditor
      id={id}
      tab={search.tab ?? "details"}
    />
  );
}
