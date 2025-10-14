import { Injectable } from '@nestjs/common';

import { Grade } from '../../domain/entities/grade.entity';

@Injectable()
export class GradingService {
  async listGradesByAssignment(assignmentId: string): Promise<Grade[]> {
    return [
      {
        id: 'grade-1',
        assignmentId,
        submissionId: 'submission-1',
        studentId: 'student-1',
        score: 9,
        maxScore: 10
      }
    ];
  }
}
