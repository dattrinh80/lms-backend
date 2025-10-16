import { ApiProperty } from '@nestjs/swagger';

import { User } from '../../../domain/entities/user.entity';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty({ enum: ['ADMIN', 'STUDENT', 'TEACHER', 'PARENT', 'HUMAN_RESOURCES'] })
  role: User['role'];

  @ApiProperty({ enum: ['active', 'inactive', 'invited'] })
  status: 'active' | 'inactive' | 'invited';

  @ApiProperty({ required: false })
  phoneNumber?: string | null;

  @ApiProperty({ required: false, type: String, format: 'date' })
  dateOfBirth?: string | null;

  @ApiProperty({ required: false, type: Object })
  metadata?: Record<string, unknown>;

  static fromDomain(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.username = user.username;
    dto.displayName = user.displayName;
    dto.role = user.role;
    dto.status = user.status;
    dto.phoneNumber = user.phoneNumber ?? null;
    dto.dateOfBirth = user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : null;
    dto.metadata = user.metadata;
    return dto;
  }
}
