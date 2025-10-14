import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({ example: 'class-subject-id' })
  @IsString()
  classSubjectId: string;

  @ApiProperty({ example: 'teacher-id', required: false })
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiProperty({ example: 'room-id', required: false })
  @IsOptional()
  @IsString()
  roomId?: string;

  @ApiProperty({ example: '2024-10-10T09:00:00Z' })
  @IsDateString()
  startsAt: string;

  @ApiProperty({ example: '2024-10-10T10:30:00Z' })
  @IsDateString()
  endsAt: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  recurrenceId?: string;
}
