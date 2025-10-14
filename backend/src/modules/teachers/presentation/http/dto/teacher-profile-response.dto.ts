import { ApiProperty } from '@nestjs/swagger';

import { Teacher } from '../../../domain/entities/teacher.entity';

class TeacherUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty({ type: [String] })
  roles: string[];

  @ApiProperty()
  status: string;
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
        displayName: teacher.user.displayName,
        roles: teacher.user.roles,
        status: teacher.user.status
      }
    };
  }
}
