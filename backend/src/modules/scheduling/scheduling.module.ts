import { Module } from '@nestjs/common';

import { DatabaseModule } from '@app/infrastructure/database';

import { SchedulingService } from './application/services/scheduling.service';
import { SessionsRepository } from './domain/repositories/sessions.repository';
import { PrismaSessionsRepository } from './infrastructure/persistence/prisma-sessions.repository';
import { SchedulingController } from './presentation/http/scheduling.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [SchedulingController],
  providers: [
    SchedulingService,
    {
      provide: SessionsRepository,
      useClass: PrismaSessionsRepository
    }
  ],
  exports: [SchedulingService, SessionsRepository]
})
export class SchedulingModule {}
