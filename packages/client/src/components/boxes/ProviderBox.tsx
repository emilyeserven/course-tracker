import type { CourseProvider } from "@emstack/types/src";

import { BookIcon, DollarSignIcon, RefreshCwIcon } from "lucide-react";

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

export function ProviderBox({
  id,
  name,
  description,
  resourceCount,
  isCourseFeesShared,
  cost,
}: CourseProvider) {
  return (
    <ContentBox>
      <ContentBoxHeader>
        <ContentBoxHeaderBar />
        <ContentBoxTitle>
          <h3 className="text-2xl">
            <EntityLink
              entity="providers"
              id={id}
            >{name}
            </EntityLink>
          </h3>
        </ContentBoxTitle>
      </ContentBoxHeader>
      <ContentBoxBody>
        <Description description={description} />
      </ContentBoxBody>
      <ContentBoxFooter>
        <CourseMetaItem
          value={resourceCount}
          condition={true}
          iconNode={<BookIcon size={16} />}
        />
        <CourseMetaItem
          value={cost}
          condition={cost != null && cost !== ""}
          iconNode={<DollarSignIcon size={16} />}
        />
        <CourseMetaItem
          value="Recurs"
          condition={!!isCourseFeesShared}
          iconNode={<RefreshCwIcon size={16} />}
        />
      </ContentBoxFooter>
    </ContentBox>
  );
}
