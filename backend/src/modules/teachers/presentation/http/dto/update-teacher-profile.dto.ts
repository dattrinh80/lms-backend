import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTeacherProfileDto {
  @ApiPropertyOptional({ example: 'Updated bio text' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string | null;

  @ApiPropertyOptional({
    example: { preferredCampus: 'Downtown' }
  })
  @IsOptional()
  metadata?: Record<string, unknown> | null;
}
