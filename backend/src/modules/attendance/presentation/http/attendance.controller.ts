import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AttendanceService } from '../../application/services/attendance.service';

@ApiTags('attendance')
@Controller({
  path: 'attendance',
  version: '1'
})
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'List attendance records for a specific session' })
  async listBySession(@Param('sessionId') sessionId: string) {
    return this.attendanceService.listBySession(sessionId);
  }
}
