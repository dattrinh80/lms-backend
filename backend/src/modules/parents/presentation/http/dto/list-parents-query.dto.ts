import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

import { PaginatedQueryDto } from '@app/common/dto/paginated-query.dto';

export class ListParentsQueryDto extends PaginatedQueryDto {
  @ApiPropertyOptional({
    description: 'Search term applied to parent name, email or phone number'
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    description: 'Filter parents linked to a specific student ID',
    example: 'student-id-123'
  })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiPropertyOptional({
    enum: ['active', 'inactive', 'invited'],
    description: 'Filter by parent account status'
  })
  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive' | 'invited';

  @ApiPropertyOptional({
    description: 'Include linked students in the response',
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return ['true', '1', 'yes'].includes(value.toLowerCase());
    }
    return false;
  })
  @IsBoolean()
  includeStudents = false;
}
