import type { Domain } from "@emstack/types/src";

import { Link } from "@tanstack/react-router";
import { BookIcon, RadarIcon } from "lucide-react";

import { CourseMetaItem } from "@/components/boxElements/CourseMetaItem";
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
            <Link
              to="/domains/$id"
              from="/domains"
              params={{
                id: id + "",
              }}
              className="hover:text-blue-600"
            >
              {title}
            </Link>
          </h3>
        </ContentBoxTitle>
      </ContentBoxHeader>
      <ContentBoxBody>
        <p>{description ? description : <i>No description provided.</i>}</p>
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
