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
import { Badge } from "@/components/ui/badge";

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
              <Badge className="border-transparent bg-primary/10 text-primary">
                <StarIcon className="fill-current" />
                Focused
              </Badge>
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
