import type { CourseInCourses } from "@emstack/types/src";

import { Link } from "@tanstack/react-router";
import {
  CalendarCheckIcon,
  CheckCheckIcon,
  DollarSignIcon,
  ExternalLink,
  TimerIcon,
} from "lucide-react";

import { CourseMetaItem } from "@/components/boxElements/CourseMetaItem";
import { Description } from "@/components/boxElements/Description";
import { EntityLink } from "@/components/boxElements/EntityLink";
import { StatusIndicator } from "@/components/boxElements/StatusIndicator";
import { TopicList } from "@/components/boxElements/TopicList";
import {
  ContentBox,
  ContentBoxBody,
  ContentBoxFooter,
  ContentBoxHeader,
  ContentBoxHeaderBar,
  ContentBoxTitle,
} from "@/components/boxes/ContentBox";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/ProgressBar";

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
  dailies,
}: CourseInCourses) {
  const costValue
    = cost.cost != null
      ? cost.isCostFromPlatform
        ? `${Number(cost.cost) / cost.splitBy}*`
        : Number(cost.cost)
      : null;
  const linkedDaily = dailies?.[0];
  return (
    <ContentBox>
      <ContentBoxHeader>
        <ContentBoxHeaderBar>
          <div className="flex flex-row items-center gap-2">
            <StatusIndicator status={status} />
          </div>

          <div className="flex flex-row items-center gap-2">
            {linkedDaily && (
              <Button
                variant="ghost"
                size="icon-xs"
                asChild
                title={`Open Daily: ${linkedDaily.name}`}
              >
                <Link
                  to="/dailies/$id"
                  params={{
                    id: linkedDaily.id,
                  }}
                >
                  <CalendarCheckIcon />
                </Link>
              </Button>
            )}
            {url && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Go
                  <ExternalLink />
                </a>
              </Button>
            )}
          </div>
        </ContentBoxHeaderBar>
        <ContentBoxTitle>
          <h3 className="text-xl">
            <EntityLink
              entity="resources"
              id={id}
            >{name}
            </EntityLink>
          </h3>
        </ContentBoxTitle>
      </ContentBoxHeader>
      <ContentBoxBody>
        {provider && (
          <h4 className="text-xs font-semibold uppercase">
            From
            {" "}
            <EntityLink
              entity="providers"
              id={provider.id}
              from="/resources/$id"
              className={`
                text-blue-800
                hover:text-blue-600
              `}
            >
              {provider?.name}
            </EntityLink>
          </h4>
        )}
        <TopicList topics={topics} />
        <Description description={description} />
      </ContentBoxBody>
      <ContentBoxFooter>
        <CourseMetaItem
          value={dateExpires}
          condition={!!dateExpires}
          iconNode={<TimerIcon size={16} />}
          emptyText="No course expiry given"
        />
        <CourseMetaItem
          value={
            progressCurrent && progressTotal
              ? `${progressCurrent} / ${progressTotal}`
              : 0
          }
          condition={!!progressCurrent && !!progressTotal}
          iconNode={<CheckCheckIcon size={16} />}
          emptyText="No progress"
        />
        <CourseMetaItem
          value={costValue}
          condition={true}
          iconNode={
            costValue != null ? <DollarSignIcon size={16} /> : undefined
          }
          emptyText="No cost given"
        />
      </ContentBoxFooter>
      <ProgressBar
        progressCurrent={progressCurrent}
        progressTotal={progressTotal}
        status={status}
      />
    </ContentBox>
  );
}
