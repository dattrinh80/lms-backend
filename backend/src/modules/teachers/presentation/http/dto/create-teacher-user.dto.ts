import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested
} from 'class-validator';

import { CreateTeacherProfileDto } from './create-teacher-profile.dto';

const USER_STATUS_VALUES = ['active', 'inactive', 'invited'] as const;

class TeacherUserAccountDto {
  @ApiProperty({ example: 'teacher@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Jane Teacher' })
  @IsString()
  @MaxLength(150)
  displayName: string;

  @ApiProperty({ example: 'jane.teacher' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({ example: 'TeacherP@ssw0rd' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: '+84901112233', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiProperty({ example: '1985-02-10', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ enum: USER_STATUS_VALUES, required: false })
  @IsOptional()
  @IsIn(USER_STATUS_VALUES)
  status?: (typeof USER_STATUS_VALUES)[number];

  @ApiProperty({
    description: 'Optional metadata for the teacher user account',
    required: false,
    example: { locale: 'vi' }
  })
  @IsOptional()
  metadata?: Record<string, unknown>;
}

class TeacherProfilePayloadDto extends CreateTeacherProfileDto {}

export class CreateTeacherUserDto {
  @ApiProperty({ type: () => TeacherUserAccountDto })
  @ValidateNested()
  @Type(() => TeacherUserAccountDto)
  user: TeacherUserAccountDto;

  @ApiProperty({ type: () => TeacherProfilePayloadDto })
  @ValidateNested()
  @Type(() => TeacherProfilePayloadDto)
  profile: TeacherProfilePayloadDto;
}
