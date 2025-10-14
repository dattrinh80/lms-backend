import { ApiProperty } from '@nestjs/swagger';

import { ParentStudentLink } from '../../../domain/entities/parent-student-link.entity';

class ClassSectionSummaryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;
}

class StudentSummaryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false, nullable: true })
  code?: string | null;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({
    type: () => [ClassSectionSummaryResponseDto]
  })
  classSections: ClassSectionSummaryResponseDto[];
}

export class ParentStudentLinkResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  parentId: string;

  @ApiProperty()
  studentId: string;

  @ApiProperty({ required: false, nullable: true })
  relationship?: string;

  @ApiProperty()
  isPrimary: boolean;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false, nullable: true, type: () => StudentSummaryResponseDto })
  student?: StudentSummaryResponseDto;

  @ApiProperty({ required: false, nullable: true })
  invitedAt?: Date;

  @ApiProperty()
  linkedAt: Date;

  @ApiProperty({ required: false, nullable: true })
  revokedAt?: Date;

  static fromDomain(link: ParentStudentLink): ParentStudentLinkResponseDto {
    return {
      id: link.id,
      parentId: link.parentId,
      studentId: link.studentId,
      relationship: link.relationship,
      isPrimary: link.isPrimary,
      status: link.status,
      invitedAt: link.invitedAt,
      linkedAt: link.linkedAt,
      revokedAt: link.revokedAt,
      student: link.student
        ? {
            id: link.student.id,
            code: link.student.code ?? undefined,
            displayName: link.student.displayName,
            email: link.student.email,
            classSections: link.student.classSections.map(section => ({
              id: section.id,
              code: section.code,
              name: section.name
            }))
          }
        : undefined
    };
  }
}
