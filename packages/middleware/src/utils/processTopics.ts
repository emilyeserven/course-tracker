import { TopicsToCourses } from "@emstack/types/src";

export function processTopics(ttc: TopicsToCourses[] | null | undefined) {
  if (ttc && ttc.length > 0) {
    return ttc
      .filter((topicToCourse: TopicsToCourses) => topicToCourse.topic)
      .map((topicToCourse: TopicsToCourses) => ({
        name: topicToCourse.topic!.name!,
        id: topicToCourse.topic!.id!,
      }));
  }
  else {
    return [];
  }
}
