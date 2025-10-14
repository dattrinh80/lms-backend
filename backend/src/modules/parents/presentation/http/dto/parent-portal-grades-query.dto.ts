import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ParentPortalGradesQueryDto {
  @ApiPropertyOptional({ description: 'Maximum number of grade records to return', minimum: 1, maximum: 200 })
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
  @Max(200)
  limit?: number;
}
