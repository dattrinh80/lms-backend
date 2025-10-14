import { Module } from '@nestjs/common';

import { DatabaseModule } from '@app/infrastructure/database';

import { SubjectsService } from './application/services/subjects.service';
import { SubjectsRepository } from './domain/repositories/subjects.repository';
import { PrismaSubjectsRepository } from './infrastructure/persistence/prisma-subjects.repository';
import { SubjectsController } from './presentation/http/subjects.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [SubjectsController],
  providers: [
    SubjectsService,
    {
      provide: SubjectsRepository,
      useClass: PrismaSubjectsRepository
    }
  ],
  exports: [SubjectsService, SubjectsRepository]
})
export class CurriculumModule {}
