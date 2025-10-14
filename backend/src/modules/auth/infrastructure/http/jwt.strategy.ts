import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthUser } from '../../domain/entities/auth-user.entity';

interface JwtPayload {
  sub: string;
  username: string;
  roles?: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.accessTokenSecret'),
      passReqToCallback: false
    });
  }

  validate(payload: JwtPayload): AuthUser {
    const roles = Array.isArray(payload.roles) ? payload.roles : [];

    return {
      id: payload.sub,
      username: payload.username,
      roles
    };
  }
}
