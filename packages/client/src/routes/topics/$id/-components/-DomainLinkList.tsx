import type { TopicDomain } from "@emstack/types";

import { Link } from "@tanstack/react-router";

/** Bulleted list of links to the domains a topic belongs to. */
export function DomainLinkList({
  domains,
}: { domains: TopicDomain[] }) {
  return (
    <ul className="ml-5 list-disc">
      {domains
        .filter(domain => domain.id !== undefined)
        .map(domain => (
          <li key={domain.id}>
            <Link
              to="/domains/$id"
              params={{
                id: domain.id + "",
              }}
              className={`
                font-bold text-blue-800
                hover:text-blue-600
                dark:text-blue-300
              `}
            >
              {domain.title}
            </Link>
          </li>
        ))}
    </ul>
  );
}
