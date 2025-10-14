import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'teacher@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Teacher Demo' })
  @IsString()
  @MaxLength(150)
  displayName: string;

  @ApiProperty({ example: 'StrongP@ssw0rd!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: ['TEACHER'], isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roles: string[];

  @ApiProperty({ example: 'active', required: false })
  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive' | 'invited';
}
