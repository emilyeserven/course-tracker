interface OnboardCourse {
  name: string;
  url: string;
  id: number;
}

export interface OnboardData {
  name: string;
  courses: OnboardCourse[];
}
