import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AttendanceService } from '../../application/services/attendance.service';

@ApiTags('attendance')
@Controller({
  path: 'attendance',
  version: '1'
})
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('sessions/:sessionId')
  async listBySession(@Param('sessionId') sessionId: string) {
    return this.attendanceService.listBySession(sessionId);
  }
}
