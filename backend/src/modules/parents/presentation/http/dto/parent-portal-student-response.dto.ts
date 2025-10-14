import { ApiProperty } from '@nestjs/swagger';

import { ParentPortalStudentSummary } from '../../../application/dto/parent-portal.dto';

class PortalClassSectionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;
}

export class ParentPortalStudentResponseDto {
  @ApiProperty()
  studentId: string;

  @ApiProperty({ required: false, nullable: true })
  studentCode?: string | null;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false, nullable: true })
  relationship?: string;

  @ApiProperty()
  isPrimary: boolean;

  @ApiProperty()
  status: string;

  @ApiProperty({ type: () => [PortalClassSectionResponseDto] })
  classSections: PortalClassSectionResponseDto[];

  static fromSummary(summary: ParentPortalStudentSummary): ParentPortalStudentResponseDto {
    return {
      studentId: summary.studentId,
      studentCode: summary.studentCode ?? null,
      displayName: summary.displayName,
      email: summary.email,
      relationship: summary.relationship,
      isPrimary: summary.isPrimary,
      status: summary.status,
      classSections: summary.classSections.map(section => ({
        id: section.id,
        code: section.code,
        name: section.name
      }))
    };
  }
}
