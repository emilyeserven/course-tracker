import { TopicsToResources } from "@emstack/types/src";

export function processCourses(ttc: TopicsToResources[] | null | undefined) {
  if (ttc && ttc.length > 0) {
    return ttc.map((topicToCourse: TopicsToResources) => {
      if (topicToCourse.resource) {
        return {
          name: topicToCourse.resource.name,
          id: topicToCourse.resource.id,
        };
      }
    });
  }
  else {
    return [];
  }
}
