import { Schedule } from '../entities/schedule.entity';

export interface ScheduleFilters {
  classSectionId?: string;
  classSubjectId?: string;
  teacherId?: string;
  studentId?: string;
  from?: Date;
  to?: Date;
}

export interface CreateSessionInput {
  classSubjectId: string;
  teacherId?: string;
  roomId?: string;
  startsAt: Date;
  endsAt: Date;
  recurrenceId?: string;
  metadata?: Record<string, unknown>;
}

export abstract class SessionsRepository {
  abstract create(input: CreateSessionInput): Promise<Schedule>;
  abstract findById(id: string): Promise<Schedule | null>;
  abstract list(filters?: ScheduleFilters): Promise<Schedule[]>;
}
