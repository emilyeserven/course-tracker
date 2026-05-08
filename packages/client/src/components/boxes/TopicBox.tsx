import type { TopicForTopicsPage } from "@emstack/types/src";

import {
  BookIcon,
} from "lucide-react";

import { CourseMetaItem } from "@/components/boxElements/CourseMetaItem";
import { Description } from "@/components/boxElements/Description";
import { EntityLink } from "@/components/boxElements/EntityLink";
import {
  ContentBox,
  ContentBoxBody,
  ContentBoxFooter, ContentBoxHeader,
  ContentBoxHeaderBar,
  ContentBoxTitle,
} from "@/components/boxes/ContentBox";

export function TopicBox({
  id,
  name,
  description,
  courseCount,
  domains,
}: TopicForTopicsPage) {
  return (
    <ContentBox>
      <ContentBoxHeader>
        <ContentBoxHeaderBar />
        <ContentBoxTitle>
          <h3 className="text-2xl">
            <EntityLink
              entity="topics"
              id={id}
            >{name}
            </EntityLink>
          </h3>
        </ContentBoxTitle>
      </ContentBoxHeader>
      <ContentBoxBody>
        {domains && domains.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {domains.map(domain => (
              <span
                key={domain.id}
                className="
                  rounded-sm bg-gray-100 px-2 py-0.5 text-xs
                  text-gray-700
                "
              >
                {domain.title}
              </span>
            ))}
          </div>
        )}
        <Description description={description} />
      </ContentBoxBody>
      <ContentBoxFooter>
        <CourseMetaItem
          value={courseCount}
          condition={true}
          iconNode={<BookIcon size={16} />}
        />
      </ContentBoxFooter>
    </ContentBox>
  );
}
