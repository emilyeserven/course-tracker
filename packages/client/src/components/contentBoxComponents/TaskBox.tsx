import type { Task } from "@emstack/types";

import { Link } from "@tanstack/react-router";
import { CheckSquareIcon } from "lucide-react";

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
} from "@/components/contentBoxComponents/ContentBox";
import { Badge } from "@/components/ui/badge";
import { EmptyHint } from "@/components/ui/EmptyHint";

export function TaskBox({
  id, name, description, topic, resources,
}: Task) {
  const totalResources = resources?.length ?? 0;
  const usedResources = resources?.filter(r => r.usedYet).length ?? 0;

  return (
    <ContentBox>
      <ContentBoxHeader>
        <ContentBoxHeaderBar>
          <div className="flex flex-row items-center gap-2">
            {topic
              ? (
                <Badge
                  asChild
                  variant="secondary"
                  className="
                    bg-gray-50
                    hover:bg-gray-900 hover:text-white
                  "
                >
                  <EntityLink
                    entity="topics"
                    id={topic.id}
                  >
                    {topic.name}
                  </EntityLink>
                </Badge>
              )
              : (
                <EmptyHint>No topic</EmptyHint>
              )}
          </div>
        </ContentBoxHeaderBar>
        <ContentBoxTitle>
          <h3 className="text-xl">
            <Link
              to="/tasks/$id"
              params={{
                id,
              }}
              className="hover:text-blue-600"
            >
              {name}
            </Link>
          </h3>
        </ContentBoxTitle>
      </ContentBoxHeader>
      <ContentBoxBody>
        <Description description={description} />
      </ContentBoxBody>
      <ContentBoxFooter>
        <CourseMetaItem
          value={`${usedResources} / ${totalResources} resources used`}
          condition={true}
          iconNode={<CheckSquareIcon size={16} />}
          emptyText="No resources"
        />
      </ContentBoxFooter>
    </ContentBox>
  );
}
