import { queryKeys } from "@/utils/queryKeys";

import { IntegrationKeySection } from "./-IntegrationKeySection";

export function ReadwiseSection() {
  return (
    <IntegrationKeySection
      title="Readwise"
      placeholder="Paste your Readwise token"
      buildUpdate={key => ({
        readwiseApiKey: key,
      })}
      selectStatus={data => ({
        configured: data?.readwiseConfigured ?? false,
        hint: data?.readwiseKeyHint ?? null,
      })}
      dataQueryKey={queryKeys.readwise.readingList()}
      description={
        <>
          Connect your Readwise Reader account to show your reading list on the
          dashboard. Paste a token from
          {" "}
          <a
            href="https://readwise.io/access_token"
            target="_blank"
            rel="noreferrer"
            className="
              text-primary underline-offset-2
              hover:underline
            "
          >
            readwise.io/access_token
          </a>
          .
        </>
      }
    />
  );
}
