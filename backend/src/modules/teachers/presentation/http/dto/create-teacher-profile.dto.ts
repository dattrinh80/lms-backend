import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTeacherProfileDto {
  @ApiPropertyOptional({ example: 'English instructor with 10 years experience' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional({
    example: { specialties: ['IELTS', 'Conversation'] },
    description: 'Arbitrary metadata stored alongside the teacher profile'
  })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
