import type { Course } from "@emstack/types/src";

import { Link } from "@tanstack/react-router";
import {
  CheckCheckIcon,
  DollarSignIcon,
  ExternalLink,
  TimerIcon,
} from "lucide-react";

import { CourseMetaItem } from "@/components/boxElements/CourseMetaItem";
import { StatusIndicator } from "@/components/boxElements/StatusIndicator";
import {
  ContentBox,
  ContentBoxBody,
  ContentBoxFooter,
  ContentBoxHeader, ContentBoxHeaderBar,
  ContentBoxProgress, ContentBoxTitle,
} from "@/components/boxes/ContentBox";
import { Button } from "@/components/button";
import { TopicList } from "@/components/TopicList";

export function CourseBox({
  status,
  id,
  provider,
  url,
  name,
  topics,
  dateExpires,
  description,
  progressCurrent = 0,
  progressTotal = 0,
  cost,
}: Course) {
  const costValue = cost.isCostFromPlatform
    ? `${(Number(cost.cost) / cost.splitBy)}*`
    : Number(cost.cost);
  return (
    <ContentBox>
      <ContentBoxHeader>

        <ContentBoxHeaderBar>
          <div className="flex flex-row items-center gap-2">
            <StatusIndicator status={status} />
            <TopicList topics={topics} />
          </div>

          {url && (
            <Button
              variant="ghost"
              size="icon-xs"
            >
              <a
                href={url}
                target="_blank"
                className="cursor-pointer"
                rel="noopener noreferrer"
              >
                <ExternalLink />
              </a>
            </Button>
          )}
        </ContentBoxHeaderBar>
        <ContentBoxTitle>
          <h3 className="text-xl">
            <Link
              to="/courses/$id"
              from="/courses"
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
        { provider && <h4>From {provider}</h4> }
        <p>{description ? description : <i>No description provided.</i>}</p>
      </ContentBoxBody>
      <ContentBoxFooter>
        <CourseMetaItem
          value={dateExpires}
          condition={!!dateExpires}
          iconNode={<TimerIcon size={16} />}
          emptyText="No course expiry given"
        />
        <CourseMetaItem
          value={progressCurrent && progressTotal ? `${progressCurrent} / ${progressTotal}` : 0}
          condition={!!progressCurrent && !!progressTotal}
          iconNode={<CheckCheckIcon size={16} />}
          emptyText="No progress"
        />
        <CourseMetaItem
          value={costValue}
          condition={!!cost.cost}
          iconNode={<DollarSignIcon size={16} />}
          emptyText="No cost given"
        />
      </ContentBoxFooter>
      <ContentBoxProgress
        progressCurrent={progressCurrent}
        progressTotal={progressTotal}
        status={status}
      />
    </ContentBox>
  );
}
