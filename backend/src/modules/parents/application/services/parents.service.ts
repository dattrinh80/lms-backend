import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

import { PaginatedResult } from '@app/common/types/pagination';
import { PrismaService } from '@app/infrastructure/database';
import { serializePrismaJson } from '@app/common/utils/prisma-json.util';

import { User } from '@app/modules/identity/domain/entities/user.entity';

import { Parent } from '../../domain/entities/parent.entity';
import { ParentStudentLink } from '../../domain/entities/parent-student-link.entity';
import {
  LinkStudentInput,
  ParentsRepository,
  SearchParentsFilters,
  UpdateLinkInput
} from '../../domain/repositories/parents.repository';

interface CreateParentStudentLinkInput {
  studentId: string;
  relationship?: string;
  isPrimary?: boolean;
  status?: ParentStudentLink['status'];
  metadata?: Record<string, unknown>;
}

export interface CreateParentInput {
  email: string;
  username: string;
  displayName: string;
  password: string;
  phone?: string;
  secondaryEmail?: string;
  address?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  status?: User['status'];
  dateOfBirth?: string | null;
  students?: CreateParentStudentLinkInput[];
}

export interface UpdateParentInput {
  displayName?: string;
  username?: string;
  status?: User['status'];
  password?: string;
  phone?: string | null;
  secondaryEmail?: string | null;
  address?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  dateOfBirth?: string | null;
}

@Injectable()
export class ParentsService {
  constructor(
    private readonly parentsRepository: ParentsRepository,
    private readonly prisma: PrismaService
  ) {}

  search(filters?: SearchParentsFilters): Promise<PaginatedResult<Parent>> {
    return this.parentsRepository.search(filters);
  }

  async findById(id: string, includeStudents = false): Promise<Parent> {
    const parent = await this.parentsRepository.findById(id, {
      includeStudents,
      onlyActiveLinks: includeStudents
    });

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    return parent;
  }

  async findByUserId(userId: string, includeStudents = false): Promise<Parent> {
    const parent = await this.parentsRepository.findByUserId(userId, {
      includeStudents,
      onlyActiveLinks: includeStudents
    });

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    return parent;
  }

  async create(input: CreateParentInput): Promise<Parent> {
    const hashedPassword = await bcrypt.hash(input.password, 10);
    const phoneNumber = this.normalizePhoneNumber(input.phone);
    const dateOfBirth = this.parseDateOfBirth(input.dateOfBirth);

    const parentId = await this.prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          username: input.username,
          password: hashedPassword,
          displayName: input.displayName,
          role: 'PARENT',
          status: input.status ?? 'active',
          metadata:
            input.metadata !== undefined ? serializePrismaJson(input.metadata) : undefined,
          phoneNumber: phoneNumber === undefined ? undefined : phoneNumber,
          dateOfBirth
        }
      });

      const parent = await tx.parent.create({
        data: {
          userId: user.id,
          phone: phoneNumber ?? null,
          secondaryEmail: input.secondaryEmail,
          address: input.address,
          notes: input.notes,
          metadata:
            input.metadata !== undefined ? serializePrismaJson(input.metadata) : undefined
        }
      });

      if (input.students && input.students.length > 0) {
        for (const student of input.students) {
          const status = student.status ?? 'active';
          await tx.parentStudentLink.create({
            data: {
              parentId: parent.id,
              studentId: student.studentId,
              relationship: student.relationship,
              isPrimary: student.isPrimary ?? false,
              status,
              invitedAt: status === 'invited' ? new Date() : undefined,
              linkedAt: new Date(),
              revokedAt: status === 'revoked' ? new Date() : undefined,
              metadata:
                student.metadata !== undefined
                  ? serializePrismaJson(student.metadata)
                  : undefined
            }
          });
        }
      }

      return parent.id;
    });

    return this.findById(parentId, true);
  }

  async update(id: string, input: UpdateParentInput): Promise<Parent> {
    const parent = await this.findById(id, false);

    const result = await this.prisma.$transaction(async tx => {
      const dateOfBirth = this.parseDateOfBirth(input.dateOfBirth);
      const phoneNumber = this.normalizePhoneNumber(input.phone);

      if (
        input.displayName !== undefined ||
        input.status !== undefined ||
        input.password ||
        input.username !== undefined ||
        input.dateOfBirth !== undefined ||
        input.phone !== undefined
      ) {
        const hashedPassword = input.password ? await bcrypt.hash(input.password, 10) : undefined;
        await tx.user.update({
          where: { id: parent.userId },
          data: {
            displayName: input.displayName ?? undefined,
            status: input.status ?? undefined,
            password: hashedPassword ?? undefined,
            username: input.username ?? undefined,
            dateOfBirth,
            phoneNumber: phoneNumber === undefined ? undefined : phoneNumber
          }
        });
      }

      await tx.parent.update({
        where: { id },
        data: {
          phone: input.phone === undefined ? undefined : phoneNumber ?? null,
          secondaryEmail: input.secondaryEmail === undefined ? undefined : input.secondaryEmail,
          address: input.address === undefined ? undefined : input.address,
          notes: input.notes === undefined ? undefined : input.notes,
          metadata:
            input.metadata === undefined
              ? undefined
              : input.metadata === null
              ? Prisma.JsonNull
              : serializePrismaJson(input.metadata)
        }
      });

      return parent.id;
    });

    return this.findById(result, true);
  }

  async linkStudent(parentId: string, input: LinkStudentInput): Promise<ParentStudentLink> {
    return this.parentsRepository.linkStudent(parentId, input);
  }

  async updateLink(
    parentId: string,
    studentId: string,
    input: UpdateLinkInput
  ): Promise<ParentStudentLink> {
    return this.parentsRepository.updateLink(parentId, studentId, input);
  }

  async unlinkStudent(parentId: string, studentId: string): Promise<void> {
    await this.parentsRepository.unlinkStudent(parentId, studentId);
  }

  listLinks(parentId: string, onlyActive = false): Promise<ParentStudentLink[]> {
    return this.parentsRepository.listLinks(parentId, { onlyActive });
  }

  listParentsByStudent(
    studentId: string,
    onlyActive = false
  ): Promise<ParentStudentLink[]> {
    return this.parentsRepository.listByStudentId(studentId, { onlyActive });
  }

  private parseDateOfBirth(value?: string | null): Date | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value.trim().length === 0) {
      return null;
    }

    return new Date(value);
  }

  private normalizePhoneNumber(value?: string | null): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
}
