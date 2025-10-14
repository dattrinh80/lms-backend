import { PaginatedResult } from '@app/common/types/pagination';

import { Parent } from '../entities/parent.entity';
import {
  ParentStudentLink,
  ParentStudentLinkStatus
} from '../entities/parent-student-link.entity';

export interface CreateParentRecordInput {
  userId: string;
  phone?: string;
  secondaryEmail?: string;
  address?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateParentRecordInput {
  phone?: string | null;
  secondaryEmail?: string | null;
  address?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface SearchParentsFilters {
  query?: string;
  studentId?: string;
  status?: 'active' | 'inactive' | 'invited';
  page?: number;
  limit?: number;
  includeStudents?: boolean;
}

export interface ParentQueryOptions {
  includeStudents?: boolean;
  onlyActiveLinks?: boolean;
}

export interface LinkStudentInput {
  studentId: string;
  relationship?: string;
  isPrimary?: boolean;
  status?: ParentStudentLinkStatus;
  invitedAt?: Date;
  linkedAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface UpdateLinkInput {
  relationship?: string | null;
  isPrimary?: boolean;
  status?: ParentStudentLinkStatus;
  revokedAt?: Date | null;
  metadata?: Record<string, unknown> | null;
}

export abstract class ParentsRepository {
  abstract create(input: CreateParentRecordInput): Promise<Parent>;
  abstract update(id: string, input: UpdateParentRecordInput): Promise<Parent>;
  abstract findById(id: string, options?: ParentQueryOptions): Promise<Parent | null>;
  abstract findByUserId(userId: string, options?: ParentQueryOptions): Promise<Parent | null>;
  abstract search(filters?: SearchParentsFilters): Promise<PaginatedResult<Parent>>;
  abstract linkStudent(parentId: string, input: LinkStudentInput): Promise<ParentStudentLink>;
  abstract updateLink(
    parentId: string,
    studentId: string,
    input: UpdateLinkInput
  ): Promise<ParentStudentLink>;
  abstract unlinkStudent(parentId: string, studentId: string): Promise<void>;
  abstract listLinks(
    parentId: string,
    options?: { onlyActive?: boolean }
  ): Promise<ParentStudentLink[]>;
  abstract listByStudentId(
    studentId: string,
    options?: { onlyActive?: boolean }
  ): Promise<ParentStudentLink[]>;
}
