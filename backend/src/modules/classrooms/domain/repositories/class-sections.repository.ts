import { ClassSection } from '../entities/class-section.entity';
import { ClassSubject } from '../entities/class-subject.entity';
import { Room } from '../entities/room.entity';

export interface CreateClassSubjectInput {
  subjectId: string;
  leadTeacherId?: string;
  weeklySessions?: number;
  creditHours?: number;
  status?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateClassSectionInput {
  code: string;
  name: string;
  level?: string;
  capacity?: number;
  homeroomTeacherId?: string;
  campusId?: string;
  metadata?: Record<string, unknown>;
  startDate?: Date;
  endDate?: Date;
  subjects?: CreateClassSubjectInput[];
}

export interface UpdateClassSectionInput {
  name?: string;
  level?: string;
  capacity?: number;
  homeroomTeacherId?: string;
  campusId?: string;
  metadata?: Record<string, unknown>;
  startDate?: Date;
  endDate?: Date;
}

export interface ClassSectionListFilters {
  query?: string;
  teacherId?: string;
  subjectId?: string;
}

export abstract class ClassSectionsRepository {
  abstract create(input: CreateClassSectionInput): Promise<ClassSection>;
  abstract update(id: string, input: UpdateClassSectionInput): Promise<ClassSection>;
  abstract findById(id: string): Promise<ClassSection | null>;
  abstract findByCode(code: string): Promise<ClassSection | null>;
  abstract findAll(filters?: ClassSectionListFilters): Promise<ClassSection[]>;
  abstract addSubject(
    classSectionId: string,
    input: CreateClassSubjectInput
  ): Promise<ClassSubject>;
  abstract listSubjects(classSectionId: string): Promise<ClassSubject[]>;
  abstract removeSubject(classSectionId: string, classSubjectId: string): Promise<void>;
}

export abstract class RoomsRepository {
  abstract create(room: Omit<Room, 'id'>): Promise<Room>;
  abstract findAll(): Promise<Room[]>;
  abstract findById(id: string): Promise<Room | null>;
}
