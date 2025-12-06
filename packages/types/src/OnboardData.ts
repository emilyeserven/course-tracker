interface OnboardCourse {
  name: string;
  topic: string;
  url: string;
  id: number;
}

export interface OnboardData {
  name: string;
  topics: string[];
  courses: OnboardCourse[];
}
