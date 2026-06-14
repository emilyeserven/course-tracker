import { IntegrationKeySection } from "./-IntegrationKeySection";

import { queryKeys } from "@/utils/queryKeys";

export function TodoistSection() {
  return (
    <IntegrationKeySection
      title="Todoist"
      placeholder="Paste your Todoist API token"
      buildUpdate={key => ({
        todoistApiKey: key,
      })}
      selectStatus={data => ({
        configured: data?.todoistConfigured ?? false,
        hint: data?.todoistKeyHint ?? null,
      })}
      dataQueryKey={queryKeys.todoist.tasks()}
      description={
        <>
          Connect your Todoist account to show tasks due today and overdue on
          the dashboard. Copy your API token from
          {" "}
          <a
            href="https://app.todoist.com/app/settings/integrations/developer"
            target="_blank"
            rel="noreferrer"
            className="
              text-primary underline-offset-2
              hover:underline
            "
          >
            Settings → Integrations → Developer
          </a>
          .
        </>
      }
    />
  );
}
