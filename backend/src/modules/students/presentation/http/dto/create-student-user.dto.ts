import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
  IsIn
} from 'class-validator';

import { CreateStudentProfileDto } from './create-student-profile.dto';

const USER_STATUS_VALUES = ['active', 'inactive', 'invited'] as const;

class StudentUserAccountDto {
  @ApiProperty({ example: 'student@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Student' })
  @IsString()
  @MaxLength(150)
  displayName: string;

  @ApiProperty({ example: 'john.student' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({ example: 'StrongP@ssw0rd' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: USER_STATUS_VALUES, required: false, example: 'active' })
  @IsOptional()
  @IsIn(USER_STATUS_VALUES)
  status?: (typeof USER_STATUS_VALUES)[number];

  @ApiProperty({
    description: 'Optional metadata for the user profile',
    required: false,
    example: { locale: 'vi' }
  })
  @IsOptional()
  metadata?: Record<string, unknown>;

  @ApiProperty({ example: '+84901234567', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiProperty({ example: '2006-03-15', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}

class StudentProfilePayloadDto extends CreateStudentProfileDto {}

export class CreateStudentUserDto {
  @ApiProperty({ type: () => StudentUserAccountDto })
  @ValidateNested()
  @Type(() => StudentUserAccountDto)
  user: StudentUserAccountDto;

  @ApiProperty({ type: () => StudentProfilePayloadDto })
  @ValidateNested()
  @Type(() => StudentProfilePayloadDto)
  profile: StudentProfilePayloadDto;
}
