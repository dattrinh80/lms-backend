import { Module } from '@nestjs/common';

import { DatabaseModule } from '@app/infrastructure/database';

import { UsersService } from './application/services/users.service';
import { UsersRepository } from './domain/repositories/users.repository';
import { PrismaUsersRepository } from './infrastructure/persistence/prisma-users.repository';
import { UsersController } from './presentation/http/users.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository
    }
  ],
  exports: [UsersService, UsersRepository]
})
export class IdentityModule {}
