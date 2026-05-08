import type { Task } from "@emstack/types/src";

import { Link } from "@tanstack/react-router";
import {
  CheckSquareIcon,
  CalendarCheckIcon,
} from "lucide-react";

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
import { Button } from "@/components/ui/button";

export function TaskBox({
  id,
  name,
  description,
  topic,
  resources,
  daily,
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
                <EntityLink
                  entity="topics"
                  id={topic.id}
                  className={`
                    rounded-sm bg-gray-50 px-2 py-0.5 text-xs
                    hover:bg-gray-900 hover:text-white
                  `}
                >
                  {topic.name}
                </EntityLink>
              )
              : (
                <span className="text-xs text-muted-foreground italic">
                  No topic
                </span>
              )}
          </div>
          {daily && (
            <Button
              variant="ghost"
              size="icon-xs"
              asChild
              title={`Open Daily: ${daily.name}`}
            >
              <Link
                to="/dailies/$id"
                params={{
                  id: daily.id,
                }}
              >
                <CalendarCheckIcon />
              </Link>
            </Button>
          )}
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
