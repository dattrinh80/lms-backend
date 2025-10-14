import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { DateRangeQueryDto } from '@app/common/dto/date-range-query.dto';

export class ListSchedulesQueryDto extends DateRangeQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  classSectionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  classSubjectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  studentId?: string;
}
