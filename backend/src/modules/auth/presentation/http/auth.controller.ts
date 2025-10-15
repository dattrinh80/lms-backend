import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@app/common/decorators/current-user.decorator';

import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthService } from '../../application/services/auth.service';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { LocalAuthGuard } from '../../infrastructure/http/local-auth.guard';
import { JwtAuthGuard } from '../../infrastructure/http/jwt-auth.guard';

@ApiTags('auth')
@Controller({
  path: 'auth',
  version: '1'
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Authenticate user and return JWT tokens' })
  @Post('login')
  async login(@Body() _credentials: AuthCredentialsDto, @CurrentUser() user: AuthUser) {
    return this.authService.login(user);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using a refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Invalidate the current session on the server' })
  async logout(@CurrentUser() user: AuthUser) {
    await this.authService.logout(user);
  }
}
