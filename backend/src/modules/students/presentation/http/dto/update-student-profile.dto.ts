import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsBoolean,
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

class UpdateExistingParentLinkDto {
  @ApiPropertyOptional({ example: 'parent-id-123' })
  @IsString()
  parentId: string;

  @ApiPropertyOptional({ example: 'Guardian' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  relationship?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ enum: PARENT_STATUS_VALUES, example: 'active' })
  @IsOptional()
  @IsIn(PARENT_STATUS_VALUES)
  status?: ParentStudentLinkStatus;

  @ApiPropertyOptional({
    example: { preferredContact: 'email' },
    description: 'Metadata updates for the parent-student relationship'
  })
  @IsOptional()
  metadata?: Record<string, unknown> | null;
}

class LinkExistingParentDto {
  @ApiPropertyOptional({ example: 'parent-id-456' })
  @IsString()
  parentId: string;

  @ApiPropertyOptional({ example: 'Father' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  relationship?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ enum: PARENT_STATUS_VALUES, example: 'active' })
  @IsOptional()
  @IsIn(PARENT_STATUS_VALUES)
  status?: ParentStudentLinkStatus;

  @ApiPropertyOptional({
    example: { preferredContact: 'sms' },
    description: 'Metadata to store for the parent-student link'
  })
  @IsOptional()
  metadata?: Record<string, unknown>;
}

class CreateParentLinkDto {
  @ApiPropertyOptional({ example: 'parent2@example.com' })
  @IsString()
  email: string;

  @ApiPropertyOptional({ example: 'Jane Parent' })
  @IsString()
  @MaxLength(150)
  displayName: string;

  @ApiPropertyOptional({ example: 'jane.parent' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiPropertyOptional({ example: 'StrongPass123' })
  @IsString()
  @MinLength(8)
  @MaxLength(200)
  password: string;

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
  @IsString()
  @MaxLength(150)
  secondaryEmail?: string;

  @ApiPropertyOptional({ example: '123 Street' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ example: 'Only available weekends' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({
    example: { preferredLanguage: 'vi' },
    description: 'Additional metadata for the new parent account'
  })
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class UpdateStudentProfileDto {
  @ApiPropertyOptional({ example: 'STU-1001' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string | null;

  @ApiPropertyOptional({ example: { preferredShift: 'morning' } })
  @IsOptional()
  metadata?: Record<string, unknown> | null;

  @ApiPropertyOptional({ type: LinkExistingParentDto, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkExistingParentDto)
  linkExistingParents?: LinkExistingParentDto[];

  @ApiPropertyOptional({ type: CreateParentLinkDto, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateParentLinkDto)
  createParents?: CreateParentLinkDto[];

  @ApiPropertyOptional({ type: UpdateExistingParentLinkDto, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateExistingParentLinkDto)
  updateParentLinks?: UpdateExistingParentLinkDto[];

  @ApiPropertyOptional({
    type: String,
    isArray: true,
    description: 'Parent IDs to unlink from the student'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  unlinkParents?: string[];
}
