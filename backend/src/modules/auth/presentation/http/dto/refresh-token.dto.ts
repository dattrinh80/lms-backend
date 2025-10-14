import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Valid refresh token issued during login' })
  @IsString()
  refreshToken: string;
}
