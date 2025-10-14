import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: 'Room A' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Building 1', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 25, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}
