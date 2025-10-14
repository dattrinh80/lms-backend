import { Subject } from '../entities/subject.entity';

export interface CreateSubjectInput {
  code: string;
  name: string;
  description?: string;
  defaultDurationMinutes?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateSubjectInput {
  name?: string;
  description?: string;
  defaultDurationMinutes?: number;
  metadata?: Record<string, unknown>;
}

export abstract class SubjectsRepository {
  abstract create(input: CreateSubjectInput): Promise<Subject>;
  abstract update(id: string, input: UpdateSubjectInput): Promise<Subject>;
  abstract delete(id: string): Promise<void>;
  abstract findById(id: string): Promise<Subject | null>;
  abstract findByCode(code: string): Promise<Subject | null>;
  abstract findAll(): Promise<Subject[]>;
}
