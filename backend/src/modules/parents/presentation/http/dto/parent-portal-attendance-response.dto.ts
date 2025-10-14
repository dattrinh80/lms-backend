import { ApiProperty } from '@nestjs/swagger';

import { ParentPortalAttendanceRecord } from '../../../application/dto/parent-portal.dto';

class ParentPortalAttendanceSessionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  startsAt: Date;

  @ApiProperty()
  endsAt: Date;

  @ApiProperty()
  subjectName: string;

  @ApiProperty()
  classSectionName: string;

  @ApiProperty({ required: false, nullable: true })
  teacherName?: string;
}

export class ParentPortalAttendanceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false, nullable: true })
  note?: string;

  @ApiProperty()
  recordedAt: Date;

  @ApiProperty({ type: () => ParentPortalAttendanceSessionDto })
  session: ParentPortalAttendanceSessionDto;

  static fromRecord(record: ParentPortalAttendanceRecord): ParentPortalAttendanceResponseDto {
    return {
      id: record.id,
      status: record.status,
      note: record.note ?? undefined,
      recordedAt: record.recordedAt,
      session: {
        id: record.session.id,
        startsAt: record.session.startsAt,
        endsAt: record.session.endsAt,
        subjectName: record.session.subjectName,
        classSectionName: record.session.classSectionName,
        teacherName: record.session.teacherName
      }
    };
  }
}
