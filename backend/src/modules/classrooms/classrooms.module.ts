import { Module } from '@nestjs/common';

import { DatabaseModule } from '@app/infrastructure/database';

import { ClassesService } from './application/services/classes.service';
import { ClassSectionsRepository, RoomsRepository } from './domain/repositories/class-sections.repository';
import { PrismaClassSectionsRepository } from './infrastructure/persistence/prisma-class-sections.repository';
import { PrismaRoomsRepository } from './infrastructure/persistence/prisma-rooms.repository';
import { ClassesController } from './presentation/http/classes.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ClassesController],
  providers: [
    ClassesService,
    {
      provide: ClassSectionsRepository,
      useClass: PrismaClassSectionsRepository
    },
    {
      provide: RoomsRepository,
      useClass: PrismaRoomsRepository
    }
  ],
  exports: [ClassesService, ClassSectionsRepository, RoomsRepository]
})
export class ClassroomsModule {}
