import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: '+84901112233', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  override phoneNumber?: string | null;

  @ApiPropertyOptional({ example: '1990-05-20', nullable: true })
  @IsOptional()
  @IsDateString()
  override dateOfBirth?: string | null;
}
