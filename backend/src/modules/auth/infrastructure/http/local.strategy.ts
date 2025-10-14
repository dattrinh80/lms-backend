import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { RequestContext } from '@app/common/types/request-context';

import { AuthService } from '../../application/services/auth.service';
import { AuthCredentials } from '../../domain/entities/auth-credentials.entity';
import { AuthUser } from '../../domain/entities/auth-user.entity';

type PassportLocalConstructor = new (...args: unknown[]) => object;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const passportLocalModule = require('passport-local') as { Strategy: PassportLocalConstructor };
const PassportLocalStrategy = passportLocalModule.Strategy;

@Injectable()
export class LocalStrategy extends PassportStrategy(PassportLocalStrategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true
    });
  }

  async validate(_req: RequestContext, username: string, password: string): Promise<AuthUser> {
    const credentials: AuthCredentials = {
      username,
      password
    };

    const user = await this.authService.validateUser(credentials);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
