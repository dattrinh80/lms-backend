import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested
} from 'class-validator';

import { ParentStudentLinkStatus } from '@app/modules/parents/domain/entities/parent-student-link.entity';

const PARENT_STATUS_VALUES: ParentStudentLinkStatus[] = [
  'active',
  'inactive',
  'invited',
  'revoked'
];

class ExistingParentLinkDto {
  @ApiPropertyOptional({ example: 'parent-id-123' })
  @IsString()
  @IsNotEmpty()
  parentId: string;

  @ApiPropertyOptional({ example: 'Father' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  relationship?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ enum: PARENT_STATUS_VALUES, example: 'active' })
  @IsOptional()
  @IsIn(PARENT_STATUS_VALUES)
  status?: ParentStudentLinkStatus;
}

class NewParentDto {
  @ApiPropertyOptional({ example: 'parent2@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'Jane Parent' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  displayName: string;

  @ApiPropertyOptional({ example: 'jane.parent' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiPropertyOptional({ example: 'Parent@example123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: '+84901234567' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: '1980-04-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'backup-parent@example.com' })
  @IsOptional()
  @IsEmail()
  secondaryEmail?: string;

  @ApiPropertyOptional({ example: '123 Sample Street' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ example: 'Emergency contact only' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ example: 'Mother' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  relationship?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ enum: PARENT_STATUS_VALUES, example: 'active' })
  @IsOptional()
  @IsIn(PARENT_STATUS_VALUES)
  status?: ParentStudentLinkStatus;

  @ApiPropertyOptional({
    example: { preferredLanguage: 'vi' },
    description: 'Additional metadata for the parent account'
  })
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class CreateStudentProfileDto {
  @ApiPropertyOptional({ example: 'STU-1001' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @ApiPropertyOptional({
    description: 'Arbitrary metadata stored with the student profile',
    example: { yearGroup: '2024', notes: 'Needs special support' }
  })
  @IsOptional()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({
    type: ExistingParentLinkDto,
    isArray: true,
    description: 'Existing parent accounts to link with this student'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExistingParentLinkDto)
  linkExistingParents?: ExistingParentLinkDto[];

  @ApiPropertyOptional({
    type: NewParentDto,
    isArray: true,
    description: 'New parent accounts to create and link'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NewParentDto)
  createParents?: NewParentDto[];
}
