import { Module } from '@nestjs/common';

import { DatabaseModule } from '@app/infrastructure/database';

import { AssignmentsService } from './application/services/assignments.service';
import { GradingService } from './application/services/grading.service';
import { AssignmentsController } from './presentation/http/assignments.controller';
import { GradingController } from './presentation/http/grading.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AssignmentsController, GradingController],
  providers: [AssignmentsService, GradingService],
  exports: [AssignmentsService, GradingService]
})
export class LearningModule {}
