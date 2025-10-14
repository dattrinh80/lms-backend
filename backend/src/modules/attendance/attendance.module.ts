import { Module } from '@nestjs/common';

import { DatabaseModule } from '@app/infrastructure/database';

import { AttendanceService } from './application/services/attendance.service';
import { AttendanceController } from './presentation/http/attendance.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService]
})
export class AttendanceModule {}
