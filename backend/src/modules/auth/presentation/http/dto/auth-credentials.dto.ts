import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthCredentialsDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  password: string;
}
