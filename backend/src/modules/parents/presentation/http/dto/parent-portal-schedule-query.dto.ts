import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

import { DateRangeQueryDto } from '@app/common/dto/date-range-query.dto';

export class ParentPortalScheduleQueryDto extends DateRangeQueryDto {
  @ApiPropertyOptional({ description: 'Maximum number of sessions to return', minimum: 1, maximum: 100 })
  @Transform(({ value }) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    const parsed = Number.parseInt(String(value), 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
