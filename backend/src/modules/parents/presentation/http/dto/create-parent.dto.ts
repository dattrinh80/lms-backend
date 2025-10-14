import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested
} from 'class-validator';

const LINK_STATUS = ['active', 'invited', 'inactive', 'revoked'] as const;

class CreateParentStudentLinkDto {
  @ApiProperty({ example: 'student-id-123' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiPropertyOptional({ example: 'Mother' })
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

export class CreateParentDto {
  @ApiProperty({ example: 'parent@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Mary Parent' })
  @IsString()
  @MaxLength(150)
  displayName: string;

  @ApiProperty({ example: 'StrongP@ssw0rd' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: '+84901234567' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: 'backup@example.com' })
  @IsOptional()
  @IsEmail()
  secondaryEmail?: string;

  @ApiPropertyOptional({ example: '123 Sample street' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ example: 'Prefers SMS contact' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({
    example: { preferredLanguage: 'vi' },
    description: 'Additional metadata stored as key-value pairs'
  })
  @IsOptional()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'invited'], example: 'active' })
  @IsOptional()
  @IsIn(['active', 'inactive', 'invited'])
  status?: 'active' | 'inactive' | 'invited';

  @ApiPropertyOptional({
    type: CreateParentStudentLinkDto,
    isArray: true,
    description: 'Initial student links for the parent'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateParentStudentLinkDto)
  students?: CreateParentStudentLinkDto[];
}
