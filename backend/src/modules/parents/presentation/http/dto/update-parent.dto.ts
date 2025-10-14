import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateParentDto {
  @ApiPropertyOptional({ example: 'Mary Parent' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  displayName?: string;

  @ApiPropertyOptional({ example: 'NewStrongP@ssw0rd' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'invited'], example: 'active' })
  @IsOptional()
  @IsIn(['active', 'inactive', 'invited'])
  status?: 'active' | 'inactive' | 'invited';

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

  @ApiPropertyOptional({ example: 'Prefers phone calls after 6pm' })
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
}
