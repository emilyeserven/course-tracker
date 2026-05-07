import type { Domain } from "@emstack/types/src";

import { BookIcon, RadarIcon } from "lucide-react";

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
  hasRadar,
}: Domain) {
  return (
    <ContentBox>
      <ContentBoxHeader>
        <ContentBoxHeaderBar />
        <ContentBoxTitle>
          <h3 className="text-2xl">
            <EntityLink
              entity="domains"
              id={id}
            >{title}
            </EntityLink>
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
        <CourseMetaItem
          value="Radar"
          condition={!!hasRadar}
          iconNode={<RadarIcon size={16} />}
        />
      </ContentBoxFooter>
    </ContentBox>
  );
}
