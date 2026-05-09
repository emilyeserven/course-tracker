import { TopicsToResources } from "@emstack/types/src";

export function processTopics(ttc: TopicsToResources[] | null | undefined) {
  if (ttc && ttc.length > 0) {
    return ttc
      .filter((topicToCourse: TopicsToResources) => topicToCourse.topic)
      .map((topicToCourse: TopicsToResources) => ({
        name: topicToCourse.topic!.name!,
        id: topicToCourse.topic!.id!,
      }));
  }
  else {
    return [];
  }
}
