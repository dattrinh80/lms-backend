export interface Grade {
  id: string;
  assignmentId: string;
  submissionId: string;
  studentId: string;
  score: number;
  maxScore: number;
  rubric?: Record<string, number>;
  feedback?: string;
}
