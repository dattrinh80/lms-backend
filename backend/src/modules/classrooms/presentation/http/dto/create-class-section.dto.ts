import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested
} from 'class-validator';

class ClassSectionSubjectDto {
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
}

export class CreateClassSectionDto {
  @ApiProperty({ example: 'CLS-001' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'English Class 1' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'Beginner', required: false })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiProperty({ example: 'teacher-id', required: false })
  @IsOptional()
  @IsString()
  homeroomTeacherId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  campusId?: string;

  @ApiProperty({ required: false, example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, example: '2024-06-30' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ type: [ClassSectionSubjectDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassSectionSubjectDto)
  subjects?: ClassSectionSubjectDto[];
}
