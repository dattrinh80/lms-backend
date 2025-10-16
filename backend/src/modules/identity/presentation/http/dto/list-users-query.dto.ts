import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { TransformCommaSeparatedStrings } from '@app/common/decorators/transform/transform-comma-separated.decorator';
import { PaginatedQueryDto } from '@app/common/dto/paginated-query.dto';

import { USER_ROLES, UserRole } from '../../../domain/entities/user.entity';

export class ListUsersQueryDto extends PaginatedQueryDto {
  @ApiPropertyOptional({ description: 'Search text applied to email/display name' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  query?: string;

  @ApiPropertyOptional({
    description: 'Comma separated roles',
    example: 'TEACHER,ADMIN',
    enum: USER_ROLES,
    isArray: true
  })
  @TransformCommaSeparatedStrings()
  @IsOptional()
  @IsArray()
  @IsIn(USER_ROLES, { each: true })
  roles?: UserRole[];

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'invited'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'invited'], {
    message: 'status must be one of: active, inactive, invited'
  })
  status?: 'active' | 'inactive' | 'invited';
}
