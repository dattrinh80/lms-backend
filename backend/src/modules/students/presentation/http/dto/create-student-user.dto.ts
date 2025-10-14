import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
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
