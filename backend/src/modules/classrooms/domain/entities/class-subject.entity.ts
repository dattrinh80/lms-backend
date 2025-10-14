import { Subject } from '../../../curriculum/domain/entities/subject.entity';

export interface ClassSubject {
  id: string;
  classSectionId: string;
  subjectId: string;
  leadTeacherId?: string;
  weeklySessions?: number;
  creditHours?: number;
  status?: string;
  metadata?: Record<string, unknown>;
  subject?: Subject;
}
