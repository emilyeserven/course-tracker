import type { TopicForTopicsPage } from "@emstack/types";

import { BookIcon } from "lucide-react";

import {
  CourseMetaItem,
  Description,
  DomainTagList,
  EntityLink,
} from "@/components/boxElements";
import {
  ContentBox,
  ContentBoxBody,
  ContentBoxFooter,
  ContentBoxHeader,
  ContentBoxHeaderBar,
  ContentBoxTitle,
} from "@/components/contentBoxComponents/ContentBox";

export function TopicBox({
  id,
  name,
  description,
  resourceCount,
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
            >
              {name}
            </EntityLink>
          </h3>
        </ContentBoxTitle>
      </ContentBoxHeader>
      <ContentBoxBody>
        <DomainTagList
          domains={domains}
          className="mb-2"
        />
        <Description description={description} />
      </ContentBoxBody>
      <ContentBoxFooter>
        <CourseMetaItem
          value={resourceCount}
          condition={true}
          iconNode={<BookIcon size={16} />}
        />
      </ContentBoxFooter>
    </ContentBox>
  );
}
