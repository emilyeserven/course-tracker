import type { CourseProvider } from "@emstack/types/src";

import { Link } from "@tanstack/react-router";
import {
  BookIcon, DollarSignIcon, RefreshCwIcon,
} from "lucide-react";

import { CourseMetaItem } from "@/components/boxElements/CourseMetaItem";
import {
  ContentBox,
  ContentBoxBody,
  ContentBoxFooter, ContentBoxHeader,
  ContentBoxHeaderBar,
  ContentBoxTitle,
} from "@/components/boxes/ContentBox";

export function ProviderBox({
  id,
  name,
  description,
  courseCount,
  isCourseFeesShared,
  cost,
}: CourseProvider) {
  return (
    <ContentBox>
      <ContentBoxHeader>
        <ContentBoxHeaderBar />
        <ContentBoxTitle>
          <h3 className="text-2xl">
            <Link
              to="/providers/$id"
              from="/providers"
              params={{
                id: id + "",
              }}
              className="hover:text-blue-600"
            >{name}
            </Link>
          </h3>
        </ContentBoxTitle>
      </ContentBoxHeader>
      <ContentBoxBody>
        <p>{description ? description : <i>No description provided.</i>}</p>
      </ContentBoxBody>
      <ContentBoxFooter>
        <CourseMetaItem
          value={courseCount}
          condition={true}
          iconNode={<BookIcon size={16} />}
        />
        <CourseMetaItem
          value={cost}
          condition={!!cost}
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
