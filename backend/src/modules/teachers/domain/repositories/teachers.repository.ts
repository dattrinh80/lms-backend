import { Teacher } from '../entities/teacher.entity';

export interface CreateTeacherInput {
  userId: string;
  bio?: string | null;
  metadata?: Record<string, unknown>;
}

export interface UpdateTeacherInput {
  bio?: string | null;
  metadata?: Record<string, unknown> | null;
}

export abstract class TeachersRepository {
  abstract create(input: CreateTeacherInput): Promise<Teacher>;
  abstract updateByUserId(userId: string, input: UpdateTeacherInput): Promise<Teacher>;
  abstract deleteByUserId(userId: string): Promise<void>;
  abstract findByUserId(userId: string): Promise<Teacher | null>;
  abstract findById(id: string): Promise<Teacher | null>;
}
