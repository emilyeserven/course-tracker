import { CourseFromServer, TopicsToCourses } from "@emstack/types/src";

export function processTopics(course: CourseFromServer) {
  if (course && course.topicsToCourses) {
    return course.topicsToCourses.map((topicToCourse: TopicsToCourses) => {
      if (topicToCourse.topic) {
        return topicToCourse.topic.name;
      }
    });
  }
  else {
    return [];
  }
}
