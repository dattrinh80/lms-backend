import { ApiProperty } from '@nestjs/swagger';

import { ParentPortalScheduleItem } from '../../../application/dto/parent-portal.dto';

export class ParentPortalScheduleResponseDto {
  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  classSectionId: string;

  @ApiProperty()
  subjectId: string;

  @ApiProperty()
  subjectName: string;

  @ApiProperty()
  classSectionName: string;

  @ApiProperty({ required: false, nullable: true })
  teacherId?: string;

  @ApiProperty({ required: false, nullable: true })
  teacherName?: string;

  @ApiProperty({ required: false, nullable: true })
  roomId?: string;

  @ApiProperty({ required: false, nullable: true })
  roomName?: string;

  @ApiProperty()
  startsAt: Date;

  @ApiProperty()
  endsAt: Date;

  static fromItem(item: ParentPortalScheduleItem): ParentPortalScheduleResponseDto {
    return {
      sessionId: item.sessionId,
      classSectionId: item.classSectionId,
      subjectId: item.subjectId,
      subjectName: item.subjectName,
      classSectionName: item.classSectionName,
      teacherId: item.teacherId,
      teacherName: item.teacherName,
      roomId: item.roomId,
      roomName: item.roomName,
      startsAt: item.startsAt,
      endsAt: item.endsAt
    };
  }
}
