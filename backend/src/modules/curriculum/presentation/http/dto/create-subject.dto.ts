import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ example: 'ENG-BASIC' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'English Basics' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'Foundation English program', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 90, description: 'Default session duration in minutes', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  defaultDurationMinutes?: number;
}
