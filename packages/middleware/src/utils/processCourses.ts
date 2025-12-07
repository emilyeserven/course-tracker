import { TopicsToCourses } from "@emstack/types/src";

export function processCourses(ttc: TopicsToCourses[] | null | undefined) {
  if (ttc && ttc.length > 0) {
    return ttc.map((topicToCourse: TopicsToCourses) => {
      if (topicToCourse.course) {
        return {
          name: topicToCourse.course.name,
          id: topicToCourse.course.id,
        };
      }
    });
  }
  else {
    return [];
  }
}
