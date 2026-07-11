import { Link } from "@tanstack/react-router";

import { InfoArea } from "@/components/layout/InfoArea";

interface ResourceLinkItem {
  id?: string;
  name?: string;
}

interface ResourceLinksSectionProps {
  resources: ResourceLinkItem[] | null | undefined;
  resourceCount: number | null | undefined;
}

/**
 * "Resources" detail-page section: an InfoArea listing linked resources as
 * bulleted links. Used by the provider detail page.
 */
export function ResourceLinksSection({
  resources,
  resourceCount,
}: ResourceLinksSectionProps) {
  return (
    <div>
      <InfoArea
        header="Resources"
        condition={!!resourceCount && resourceCount > 0}
      >
        <ul className="ml-5 list-disc">
          {resources
            && resources.map(course => (
              <li key={course.id}>
                <Link
                  to="/resources/$id"
                  params={{
                    id: course.id + "",
                  }}
                  className={`
                    font-bold text-blue-800
                    hover:text-blue-600
                    dark:text-blue-300
                  `}
                >
                  {course.name}
                </Link>
              </li>
            ))}
        </ul>
      </InfoArea>
    </div>
  );
}
