import type { TopicForTopicsPage } from "@emstack/types/src";

import { Link } from "@tanstack/react-router";
import {
  BookIcon,
} from "lucide-react";

import {
  ContentBox,
  ContentBoxBody,
  ContentBoxFooter, ContentBoxHeader,
  ContentBoxHeaderBar,
  ContentBoxTitle,
} from "@/components/boxes/ContentBox";
import { CourseMetaItem } from "@/components/CourseMetaItem";

export function TopicBox({
  id,
  name,
  description,
  courseCount,
}: TopicForTopicsPage) {
  return (
    <ContentBox>
      <ContentBoxHeader>
        <ContentBoxHeaderBar />
        <ContentBoxTitle>
          <h3 className="text-2xl">
            <Link
              to="/topics/$id"
              from="/topics"
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
      </ContentBoxFooter>
    </ContentBox>
  );
}
