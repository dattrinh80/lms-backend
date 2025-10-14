import { ApiProperty } from '@nestjs/swagger';

import {
  ParentDashboardOverview,
  ParentDashboardStudentOverview
} from '../../../application/dto/parent-portal.dto';
import { ParentPortalGradeResponseDto } from './parent-portal-grade-response.dto';
import { ParentPortalScheduleResponseDto } from './parent-portal-schedule-response.dto';
import { ParentPortalStudentResponseDto } from './parent-portal-student-response.dto';

class ParentDashboardAttendanceSummaryDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  present: number;

  @ApiProperty()
  absent: number;

  @ApiProperty()
  late: number;
}

class ParentDashboardStudentDto {
  @ApiProperty({ type: () => ParentPortalStudentResponseDto })
  student: ParentPortalStudentResponseDto;

  @ApiProperty({ type: () => [ParentPortalScheduleResponseDto] })
  upcomingSessions: ParentPortalScheduleResponseDto[];

  @ApiProperty({ type: () => [ParentPortalGradeResponseDto] })
  latestGrades: ParentPortalGradeResponseDto[];

  @ApiProperty({ type: () => ParentDashboardAttendanceSummaryDto })
  attendanceSummary: ParentDashboardAttendanceSummaryDto;

  @ApiProperty()
  outstandingAmount: number;

  static fromOverview(overview: ParentDashboardStudentOverview): ParentDashboardStudentDto {
    return {
      student: ParentPortalStudentResponseDto.fromSummary(overview.student),
      upcomingSessions: overview.upcomingSessions.map(item =>
        ParentPortalScheduleResponseDto.fromItem(item)
      ),
      latestGrades: overview.latestGrades.map(grade =>
        ParentPortalGradeResponseDto.fromSummary(grade)
      ),
      attendanceSummary: {
        total: overview.attendanceSummary.total,
        present: overview.attendanceSummary.present,
        absent: overview.attendanceSummary.absent,
        late: overview.attendanceSummary.late
      },
      outstandingAmount: overview.outstandingAmount
    };
  }
}

export class ParentDashboardResponseDto {
  @ApiProperty()
  parentId: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty({ type: () => [ParentDashboardStudentDto] })
  students: ParentDashboardStudentDto[];

  static fromOverview(overview: ParentDashboardOverview): ParentDashboardResponseDto {
    return {
      parentId: overview.parentId,
      displayName: overview.displayName,
      students: overview.students.map(student => ParentDashboardStudentDto.fromOverview(student))
    };
  }
}
