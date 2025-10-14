import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

const toDateOrUndefined = (value: unknown): Date | undefined => {
  if (!value) {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.valueOf()) ? undefined : date;
};

export class DateRangeQueryDto {
  @ApiPropertyOptional({ description: 'Start date in ISO 8601 format' })
  @Transform(({ value }) => toDateOrUndefined(value))
  @IsOptional()
  from?: Date;

  @ApiPropertyOptional({ description: 'End date in ISO 8601 format' })
  @Transform(({ value }) => toDateOrUndefined(value))
  @IsOptional()
  to?: Date;
}
