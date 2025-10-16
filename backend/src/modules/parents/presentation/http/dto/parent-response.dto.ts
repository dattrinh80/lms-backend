import { ApiProperty } from '@nestjs/swagger';

import { Parent } from '../../../domain/entities/parent.entity';
import { ParentStudentLink } from '../../../domain/entities/parent-student-link.entity';
import { ParentStudentLinkResponseDto } from './parent-student-link-response.dto';

export class ParentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ enum: ['ADMIN', 'STUDENT', 'TEACHER', 'PARENT', 'HUMAN_RESOURCES'] })
  role: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false, nullable: true })
  phoneNumber?: string | null;

  @ApiProperty({ required: false, nullable: true })
  dateOfBirth?: string | null;

  @ApiProperty({ required: false, nullable: true })
  phone?: string;

  @ApiProperty({ required: false, nullable: true })
  secondaryEmail?: string;

  @ApiProperty({ required: false, nullable: true })
  address?: string;

  @ApiProperty({ required: false, nullable: true })
  notes?: string;

  @ApiProperty({ required: false, nullable: true })
  metadata?: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => [ParentStudentLinkResponseDto] })
  links: ParentStudentLinkResponseDto[];

  static fromDomain(parent: Parent): ParentResponseDto {
    return {
      id: parent.id,
      userId: parent.userId,
      email: parent.user.email,
      displayName: parent.user.displayName,
      username: parent.user.username,
      role: parent.user.role,
      status: parent.user.status,
      phoneNumber: parent.user.phoneNumber ?? null,
      dateOfBirth: parent.user.dateOfBirth
        ? parent.user.dateOfBirth.toISOString().split('T')[0]
        : null,
      phone: parent.phone ?? undefined,
      secondaryEmail: parent.secondaryEmail ?? undefined,
      address: parent.address ?? undefined,
      notes: parent.notes ?? undefined,
      metadata: parent.metadata ?? undefined,
      createdAt: parent.createdAt,
      updatedAt: parent.updatedAt,
      links: (parent.links ?? []).map((link: ParentStudentLink) =>
        ParentStudentLinkResponseDto.fromDomain(link)
      )
    };
  }
}
