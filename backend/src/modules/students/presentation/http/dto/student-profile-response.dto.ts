import { ApiProperty } from '@nestjs/swagger';

import { ParentStudentLink } from '@app/modules/parents/domain/entities/parent-student-link.entity';

import { Student } from '../../../domain/entities/student.entity';

class StudentUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty({ enum: ['ADMIN', 'STUDENT', 'TEACHER', 'PARENT', 'HUMAN_RESOURCES'] })
  role: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false, nullable: true })
  phoneNumber?: string | null;

  @ApiProperty({ required: false, nullable: true })
  dateOfBirth?: string | null;
}

class StudentParentResponseDto {
  @ApiProperty()
  parentId: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  isPrimary: boolean;

  @ApiProperty({ required: false, nullable: true })
  relationship?: string;

  @ApiProperty({ required: false, nullable: true })
  parentDisplayName?: string;

  @ApiProperty({ required: false, nullable: true })
  parentEmail?: string;

  @ApiProperty({ required: false, nullable: true })
  parentPhone?: string | null;

  @ApiProperty({ required: false, nullable: true })
  parentSecondaryEmail?: string | null;
}

export class StudentProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ required: false, nullable: true })
  code?: string | null;

  @ApiProperty({ required: false, nullable: true })
  metadata?: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => StudentUserResponseDto })
  user: StudentUserResponseDto;

  @ApiProperty({ type: () => [StudentParentResponseDto] })
  parents: StudentParentResponseDto[];

  static fromDomain(student: Student, parents: ParentStudentLink[]): StudentProfileResponseDto {
    return {
      id: student.id,
      userId: student.userId,
      code: student.code ?? null,
      metadata: student.metadata ?? undefined,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      user: {
        id: student.user.id,
        email: student.user.email,
        username: student.user.username,
        displayName: student.user.displayName,
        role: student.user.role,
        status: student.user.status,
        phoneNumber: student.user.phoneNumber ?? null,
        dateOfBirth: student.user.dateOfBirth
          ? student.user.dateOfBirth.toISOString().split('T')[0]
          : null
      },
      parents: parents.map(parent => ({
        parentId: parent.parentId,
        status: parent.status,
        isPrimary: parent.isPrimary,
        relationship: parent.relationship,
        parentDisplayName: parent.parent?.displayName,
        parentEmail: parent.parent?.email,
        parentPhone: parent.parent?.phone ?? null,
        parentSecondaryEmail: parent.parent?.secondaryEmail ?? null
      }))
    };
  }
}
