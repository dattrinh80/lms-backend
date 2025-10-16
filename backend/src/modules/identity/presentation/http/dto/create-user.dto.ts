import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';

import { USER_ROLES, UserRole } from '../../../domain/entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'teacher@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'teacher.demo' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({ example: 'Teacher Demo' })
  @IsString()
  @MaxLength(150)
  displayName: string;

  @ApiProperty({ example: 'StrongP@ssw0rd!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: USER_ROLES })
  @IsIn(USER_ROLES)
  role: UserRole;

  @ApiProperty({ example: '+84901112233', required: false, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string | null;

  @ApiProperty({ example: '1990-05-20', required: false, nullable: true })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string | null;

  @ApiProperty({ example: 'active', required: false })
  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive' | 'invited';
}
