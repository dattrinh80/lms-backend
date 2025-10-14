import { Module } from '@nestjs/common';

import { DatabaseModule } from '@app/infrastructure/database';
import { AuthModule } from '@app/modules/auth/auth.module';
import { IdentityModule } from '@app/modules/identity/identity.module';

import { ParentsService } from './application/services/parents.service';
import { ParentPortalService } from './application/services/parent-portal.service';
import { ParentsRepository } from './domain/repositories/parents.repository';
import { PrismaParentsRepository } from './infrastructure/persistence/prisma-parents.repository';
import { ParentPortalController } from './presentation/http/parent-portal.controller';
import { ParentsController } from './presentation/http/parents.controller';

@Module({
  imports: [DatabaseModule, IdentityModule, AuthModule],
  controllers: [ParentsController, ParentPortalController],
  providers: [
    ParentsService,
    ParentPortalService,
    {
      provide: ParentsRepository,
      useClass: PrismaParentsRepository
    }
  ],
  exports: [ParentsService, ParentPortalService, ParentsRepository]
})
export class ParentsModule {}
