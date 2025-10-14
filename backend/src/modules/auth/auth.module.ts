import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { DatabaseModule } from '@app/infrastructure/database';
import { IdentityModule } from '@app/modules/identity/identity.module';

import { AuthService } from './application/services/auth.service';
import { JwtAuthGuard } from './infrastructure/http/jwt-auth.guard';
import { JwtStrategy } from './infrastructure/http/jwt.strategy';
import { LocalStrategy } from './infrastructure/http/local.strategy';
import { AuthController } from './presentation/http/auth.controller';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.accessTokenSecret'),
        signOptions: {
          expiresIn: configService.get<string>('auth.accessTokenExpiresIn')
        }
      }),
      inject: [ConfigService]
    }),
    DatabaseModule,
    IdentityModule
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard]
})
export class AuthModule {}
