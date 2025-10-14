import { ApiProperty } from '@nestjs/swagger';

import { Subject } from '../../../../curriculum/domain/entities/subject.entity';
import { ClassSection } from '../../../domain/entities/class-section.entity';
import { ClassSubject } from '../../../domain/entities/class-subject.entity';

export class SubjectSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  defaultDurationMinutes?: number;

  static fromDomain(subject: Subject): SubjectSummaryDto {
    const dto = new SubjectSummaryDto();
    dto.id = subject.id;
    dto.code = subject.code;
    dto.name = subject.name;
    dto.description = subject.description;
    dto.defaultDurationMinutes = subject.defaultDurationMinutes;
    return dto;
  }
}

export class ClassSubjectResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  classSectionId: string;

  @ApiProperty()
  subjectId: string;

  @ApiProperty({ required: false })
  leadTeacherId?: string;

  @ApiProperty({ required: false })
  weeklySessions?: number;

  @ApiProperty({ required: false })
  creditHours?: number;

  @ApiProperty({ required: false })
  status?: string;

  @ApiProperty({ required: false, type: SubjectSummaryDto })
  subject?: SubjectSummaryDto;

  static fromDomain(classSubject: ClassSubject): ClassSubjectResponseDto {
    const dto = new ClassSubjectResponseDto();
    dto.id = classSubject.id;
    dto.classSectionId = classSubject.classSectionId;
    dto.subjectId = classSubject.subjectId;
    dto.leadTeacherId = classSubject.leadTeacherId;
    dto.weeklySessions = classSubject.weeklySessions;
    dto.creditHours = classSubject.creditHours;
    dto.status = classSubject.status;
    dto.subject = classSubject.subject ? SubjectSummaryDto.fromDomain(classSubject.subject) : undefined;
    return dto;
  }
}

export class ClassSectionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  level?: string;

  @ApiProperty({ required: false })
  capacity?: number;

  @ApiProperty({ required: false })
  homeroomTeacherId?: string;

  @ApiProperty({ required: false })
  campusId?: string;

  @ApiProperty({ required: false })
  startDate?: Date;

  @ApiProperty({ required: false })
  endDate?: Date;

  @ApiProperty({ type: [ClassSubjectResponseDto], required: false })
  subjects?: ClassSubjectResponseDto[];

  static fromDomain(classSection: ClassSection): ClassSectionResponseDto {
    const dto = new ClassSectionResponseDto();
    dto.id = classSection.id;
    dto.code = classSection.code;
    dto.name = classSection.name;
    dto.level = classSection.level;
    dto.capacity = classSection.capacity;
    dto.homeroomTeacherId = classSection.homeroomTeacherId;
    dto.campusId = classSection.campusId;
    dto.startDate = classSection.startDate;
    dto.endDate = classSection.endDate;
    dto.subjects = classSection.subjects?.map(subject =>
      ClassSubjectResponseDto.fromDomain(subject)
    );
    return dto;
  }
}
