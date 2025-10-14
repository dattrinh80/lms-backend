import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { TransformCommaSeparatedStrings } from '@app/common/decorators/transform/transform-comma-separated.decorator';
import { PaginatedQueryDto } from '@app/common/dto/paginated-query.dto';

export class ListUsersQueryDto extends PaginatedQueryDto {
  @ApiPropertyOptional({ description: 'Search text applied to email/display name' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  query?: string;

  @ApiPropertyOptional({ description: 'Comma separated roles', example: 'TEACHER,ADMIN' })
  @TransformCommaSeparatedStrings()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'invited'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'invited'], {
    message: 'status must be one of: active, inactive, invited'
  })
  status?: 'active' | 'inactive' | 'invited';
}
