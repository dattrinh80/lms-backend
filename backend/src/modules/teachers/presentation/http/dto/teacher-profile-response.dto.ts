import { ApiProperty } from '@nestjs/swagger';

import { Teacher } from '../../../domain/entities/teacher.entity';

class TeacherUserResponseDto {
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

export class TeacherProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ required: false, nullable: true })
  bio?: string | null;

  @ApiProperty({ required: false, nullable: true })
  metadata?: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => TeacherUserResponseDto })
  user: TeacherUserResponseDto;

  static fromDomain(teacher: Teacher): TeacherProfileResponseDto {
    return {
      id: teacher.id,
      userId: teacher.userId,
      bio: teacher.bio ?? null,
      metadata: teacher.metadata ?? undefined,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
      user: {
        id: teacher.user.id,
        email: teacher.user.email,
        username: teacher.user.username,
        displayName: teacher.user.displayName,
        role: teacher.user.role,
        status: teacher.user.status,
        phoneNumber: teacher.user.phoneNumber ?? null,
        dateOfBirth: teacher.user.dateOfBirth
          ? teacher.user.dateOfBirth.toISOString().split('T')[0]
          : null
      }
    };
  }
}
