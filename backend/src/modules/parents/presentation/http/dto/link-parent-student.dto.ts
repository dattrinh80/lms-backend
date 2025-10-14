import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const LINK_STATUS = ['active', 'inactive', 'invited', 'revoked'] as const;

export class LinkParentStudentDto {
  @ApiProperty({ example: 'student-id-123' })
  @IsString()
  studentId: string;

  @ApiPropertyOptional({ example: 'Father' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  relationship?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ enum: LINK_STATUS, example: 'active' })
  @IsOptional()
  @IsIn(LINK_STATUS)
  status?: (typeof LINK_STATUS)[number];
}
