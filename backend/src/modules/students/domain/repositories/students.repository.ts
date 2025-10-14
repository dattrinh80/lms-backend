import { Student } from '../entities/student.entity';

export interface CreateStudentInput {
  userId: string;
  code?: string | null;
  metadata?: Record<string, unknown>;
}

export interface UpdateStudentInput {
  code?: string | null;
  metadata?: Record<string, unknown> | null;
}

export abstract class StudentsRepository {
  abstract create(input: CreateStudentInput): Promise<Student>;
  abstract updateByUserId(userId: string, input: UpdateStudentInput): Promise<Student>;
  abstract deleteByUserId(userId: string): Promise<void>;
  abstract findByUserId(userId: string): Promise<Student | null>;
  abstract findById(id: string): Promise<Student | null>;
}
