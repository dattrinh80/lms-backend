import { ApiProperty } from '@nestjs/swagger';

import { User } from '../../../domain/entities/user.entity';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty({ isArray: true })
  roles: string[];

  @ApiProperty({ enum: ['active', 'inactive', 'invited'] })
  status: 'active' | 'inactive' | 'invited';

  @ApiProperty({ required: false, type: Object })
  metadata?: Record<string, unknown>;

  static fromDomain(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.displayName = user.displayName;
    dto.roles = user.roles;
    dto.status = user.status;
    dto.metadata = user.metadata;
    return dto;
  }
}
