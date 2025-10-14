import { ApiProperty } from '@nestjs/swagger';

import { ParentPortalGradeSummary } from '../../../application/dto/parent-portal.dto';

export class ParentPortalGradeResponseDto {
  @ApiProperty()
  gradeId: string;

  @ApiProperty()
  assignmentId: string;

  @ApiProperty()
  assignmentTitle: string;

  @ApiProperty()
  score: number;

  @ApiProperty()
  maxScore: number;

  @ApiProperty()
  gradedAt: Date;

  @ApiProperty()
  subjectName: string;

  @ApiProperty()
  classSectionName: string;

  @ApiProperty({ required: false, nullable: true })
  teacherName?: string;

  static fromSummary(summary: ParentPortalGradeSummary): ParentPortalGradeResponseDto {
    return {
      gradeId: summary.gradeId,
      assignmentId: summary.assignmentId,
      assignmentTitle: summary.assignmentTitle,
      score: summary.score,
      maxScore: summary.maxScore,
      gradedAt: summary.gradedAt,
      subjectName: summary.subjectName,
      classSectionName: summary.classSectionName,
      teacherName: summary.teacherName
    };
  }
}
