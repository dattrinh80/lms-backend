import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@app/common/decorators/current-user.decorator';

import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from '../../application/services/auth.service';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { LocalAuthGuard } from '../../infrastructure/http/local-auth.guard';

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
}
