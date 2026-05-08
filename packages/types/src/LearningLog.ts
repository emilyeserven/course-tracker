import { DailyCompletionStatus } from "@/Daily";

export type LearningLogEntrySource = "manual" | "daily";

export interface LearningLogEntry {
  id: string;
  source: LearningLogEntrySource;
  date: string;
  description: string;
  link?: string | null;
  dailyId?: string | null;
  dailyName?: string | null;
  courseId?: string | null;
  courseName?: string | null;
  status?: DailyCompletionStatus | null;
}

export interface DomainExcludedTopic {
  id: string;
  name: string;
  reason?: string | null;
}

export interface DomainTopicCourse {
  id: string;
  name: string;
  progressCurrent?: number | null;
  progressTotal?: number | null;
  status?: string | null;
}

export interface DomainTopic {
  id: string;
  name: string;
  description?: string | null;
  reason?: string | null;
  courses?: DomainTopicCourse[];
}
