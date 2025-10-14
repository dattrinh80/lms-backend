import { ClassSubject } from './class-subject.entity';

export interface ClassSection {
  id: string;
  code: string;
  name: string;
  level?: string;
  capacity?: number;
  homeroomTeacherId?: string;
  campusId?: string;
  metadata?: Record<string, unknown>;
  startDate?: Date;
  endDate?: Date;
  subjects?: ClassSubject[];
}
