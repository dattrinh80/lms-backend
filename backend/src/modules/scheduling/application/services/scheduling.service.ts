import { Injectable } from '@nestjs/common';

import { Schedule } from '../../domain/entities/schedule.entity';
import {
  CreateSessionInput,
  ScheduleFilters,
  SessionsRepository
} from '../../domain/repositories/sessions.repository';

@Injectable()
export class SchedulingService {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  listSchedules(filters?: ScheduleFilters): Promise<Schedule[]> {
    return this.sessionsRepository.list(filters);
  }

  createSession(input: CreateSessionInput): Promise<Schedule> {
    return this.sessionsRepository.create(input);
  }

  getSession(id: string): Promise<Schedule | null> {
    return this.sessionsRepository.findById(id);
  }
}
