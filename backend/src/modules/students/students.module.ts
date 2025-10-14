import { Module } from '@nestjs/common';

import { DatabaseModule } from '@app/infrastructure/database';
import { IdentityModule } from '@app/modules/identity/identity.module';
import { ParentsModule } from '@app/modules/parents/parents.module';
import { AuthModule } from '@app/modules/auth/auth.module';

import { StudentsService } from './application/services/students.service';
import { StudentsRepository } from './domain/repositories/students.repository';
import { PrismaStudentsRepository } from './infrastructure/persistence/prisma-students.repository';
import { StudentsController } from './presentation/http/students.controller';
import { StudentUsersController } from './presentation/http/student-users.controller';

@Module({
  imports: [DatabaseModule, IdentityModule, ParentsModule, AuthModule],
  controllers: [StudentsController, StudentUsersController],
  providers: [
    StudentsService,
    {
      provide: StudentsRepository,
      useClass: PrismaStudentsRepository
    }
  ],
  exports: [StudentsService, StudentsRepository]
})
export class StudentsModule {}
