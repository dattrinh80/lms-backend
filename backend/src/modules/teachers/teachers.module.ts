import { Module } from '@nestjs/common';

import { DatabaseModule } from '@app/infrastructure/database';
import { IdentityModule } from '@app/modules/identity/identity.module';

import { TeachersService } from './application/services/teachers.service';
import { TeachersRepository } from './domain/repositories/teachers.repository';
import { PrismaTeachersRepository } from './infrastructure/persistence/prisma-teachers.repository';
import { TeachersController } from './presentation/http/teachers.controller';

@Module({
  imports: [DatabaseModule, IdentityModule],
  controllers: [TeachersController],
  providers: [
    TeachersService,
    {
      provide: TeachersRepository,
      useClass: PrismaTeachersRepository
    }
  ],
  exports: [TeachersService, TeachersRepository]
})
export class TeachersModule {}
