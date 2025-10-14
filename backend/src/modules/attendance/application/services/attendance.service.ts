import { Injectable } from '@nestjs/common';

import { AttendanceRecord } from '../../domain/entities/attendance-record.entity';

@Injectable()
export class AttendanceService {
  async listBySession(sessionId: string): Promise<AttendanceRecord[]> {
    return [
      {
        id: 'attendance-1',
        sessionId,
        studentId: 'student-1',
        status: 'present',
        recordedAt: new Date()
      }
    ];
  }
}
