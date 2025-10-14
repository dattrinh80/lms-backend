import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AddClassSubjectDto {
  @ApiProperty({ example: 'subject-id' })
  @IsString()
  subjectId: string;

  @ApiProperty({ example: 'teacher-id', required: false })
  @IsOptional()
  @IsString()
  leadTeacherId?: string;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  weeklySessions?: number;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  creditHours?: number;

  @ApiProperty({ example: 'active', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}
