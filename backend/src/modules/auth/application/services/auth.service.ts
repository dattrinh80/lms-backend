import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserRole } from '@app/modules/identity/domain/entities/user.entity';

import { UsersRepository } from '../../../identity/domain/repositories/users.repository';
import { AuthCredentials } from '../../domain/entities/auth-credentials.entity';
import { AuthUser } from '../../domain/entities/auth-user.entity';

interface JwtPayload {
  sub: string;
  username: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository
  ) {}

  async validateUser(credentials: AuthCredentials): Promise<AuthUser | null> {
    let user = await this.usersRepository.findByUsername(credentials.username);

    if (!user) {
      user = await this.usersRepository.findByEmail(credentials.username);
    }

    if (!user || !user.passwordHash) {
      return null;
    }

    const passwordMatches = await bcrypt.compare(credentials.password, user.passwordHash);

    if (!passwordMatches || user.status !== 'active') {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role
    };
  }

  async login(user: AuthUser) {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('auth.refreshTokenSecret'),
      expiresIn: this.configService.get<string>('auth.refreshTokenExpiresIn')
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get<string>('auth.accessTokenExpiresIn'),
      user
    };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('auth.refreshTokenSecret')
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersRepository.findById(payload.sub);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User is not eligible for refresh');
    }

    return this.login({
      id: user.id,
      username: user.username,
      role: user.role
    });
  }

  async logout(_user: AuthUser): Promise<void> {
    // Stateless JWTs cannot be invalidated server-side without token storage.
    // This hook allows plugging in future revocation/blacklist logic.
    return;
  }
}
