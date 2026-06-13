import type { Domain } from "@emstack/types";

import { BookIcon, StarIcon } from "lucide-react";

import { CourseMetaItem } from "@/components/boxElements/CourseMetaItem";
import { Description } from "@/components/boxElements/Description";
import { EntityLink } from "@/components/boxElements/EntityLink";
import {
  ContentBox,
  ContentBoxBody,
  ContentBoxFooter,
  ContentBoxHeader,
  ContentBoxHeaderBar,
  ContentBoxTitle,
} from "@/components/boxes/ContentBox";

export function DomainBox({
  id,
  title,
  description,
  topicCount,
  focused = false,
}: Domain & { focused?: boolean }) {
  return (
    <ContentBox>
      <ContentBoxHeader>
        <ContentBoxHeaderBar />
        <ContentBoxTitle>
          <h3 className="flex items-center gap-2 text-2xl">
            <EntityLink
              entity="domains"
              id={id}
            >{title}
            </EntityLink>
            {focused && (
              <span
                className="
                  inline-flex items-center gap-1 rounded-full bg-primary/10 px-2
                  py-0.5 text-xs font-medium text-primary
                "
              >
                <StarIcon className="size-3 fill-current" />
                Focused
              </span>
            )}
          </h3>
        </ContentBoxTitle>
      </ContentBoxHeader>
      <ContentBoxBody>
        <Description description={description} />
      </ContentBoxBody>
      <ContentBoxFooter>
        <CourseMetaItem
          value={topicCount}
          condition={true}
          iconNode={<BookIcon size={16} />}
        />
      </ContentBoxFooter>
    </ContentBox>
  );
}
