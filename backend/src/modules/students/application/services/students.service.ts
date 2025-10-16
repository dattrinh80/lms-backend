import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { Student } from '../../domain/entities/student.entity';
import { StudentsRepository } from '../../domain/repositories/students.repository';
import { ParentsService } from '@app/modules/parents/application/services/parents.service';
import { ParentStudentLink } from '@app/modules/parents/domain/entities/parent-student-link.entity';
import { UsersRepository } from '@app/modules/identity/domain/repositories/users.repository';
import { PrismaService } from '@app/infrastructure/database';
import { serializePrismaJson } from '@app/common/utils/prisma-json.util';
import { User } from '@app/modules/identity/domain/entities/user.entity';
import { Prisma } from '@prisma/client';

export interface ExistingParentLinkPayload {
  parentId: string;
  relationship?: string;
  isPrimary?: boolean;
  status?: ParentStudentLink['status'];
  metadata?: Record<string, unknown>;
}

export interface NewParentPayload {
  email: string;
  username: string;
  displayName: string;
  password: string;
  phone?: string;
  secondaryEmail?: string;
  address?: string;
  notes?: string;
  relationship?: string;
  isPrimary?: boolean;
  status?: ParentStudentLink['status'];
  metadata?: Record<string, unknown>;
  dateOfBirth?: string | null;
}

export interface UpdateParentLinkPayload {
  parentId: string;
  relationship?: string | null;
  isPrimary?: boolean;
  status?: ParentStudentLink['status'];
  metadata?: Record<string, unknown> | null;
}

export interface CreateStudentProfileInput {
  code?: string | null;
  metadata?: Record<string, unknown>;
  linkExistingParents?: ExistingParentLinkPayload[];
  createParents?: NewParentPayload[];
}

export interface UpdateStudentProfileInput {
  code?: string | null;
  metadata?: Record<string, unknown> | null;
  linkExistingParents?: ExistingParentLinkPayload[];
  createParents?: NewParentPayload[];
  unlinkParents?: string[];
  updateParentLinks?: UpdateParentLinkPayload[];
}

export interface StudentProfileDetails {
  student: Student;
  parents: ParentStudentLink[];
}

export interface CreateStudentUserAccountInput {
  email: string;
  username: string;
  password: string;
  displayName: string;
  status?: User['status'];
  metadata?: Record<string, unknown>;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
}

export interface CreateStudentUserInput {
  user: CreateStudentUserAccountInput;
  profile: CreateStudentProfileInput;
}

@Injectable()
export class StudentsService {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly parentsService: ParentsService,
    private readonly prisma: PrismaService
  ) {}

  async getProfileByUserId(userId: string): Promise<StudentProfileDetails> {
    const student = await this.studentsRepository.findByUserId(userId);
    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    const parents = await this.parentsService.listParentsByStudent(student.id);

    return {
      student,
      parents
    };
  }

  async createStudentUser(input: CreateStudentUserInput): Promise<StudentProfileDetails> {
    const hashedPassword = await bcrypt.hash(input.user.password, 10);

    const userId = await this.prisma.$transaction(async tx => {
      const phoneNumber = this.normalizePhoneNumber(input.user.phoneNumber);
      const dateOfBirth = this.parseDateOfBirth(input.user.dateOfBirth);

      const createdUser = await tx.user.create({
        data: {
          email: input.user.email,
          username: input.user.username,
          password: hashedPassword,
          displayName: input.user.displayName,
          role: 'STUDENT',
          status: input.user.status ?? 'active',
          metadata:
            input.user.metadata !== undefined ? serializePrismaJson(input.user.metadata) : undefined,
          phoneNumber: phoneNumber === undefined ? undefined : phoneNumber,
          dateOfBirth
        }
      });

      const createdStudent = await tx.student.create({
        data: {
          userId: createdUser.id,
          code: input.profile.code ?? undefined,
          metadata:
            input.profile.metadata !== undefined
              ? serializePrismaJson(input.profile.metadata)
              : undefined
        }
      });

      await this.applyParentOperationsTransactional(tx, createdStudent.id, {
        linkExistingParents: input.profile.linkExistingParents,
        createParents: input.profile.createParents
      });

      return createdUser.id;
    });

    return this.getProfileByUserId(userId);
  }

  async createProfile(userId: string, input: CreateStudentProfileInput): Promise<StudentProfileDetails> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'STUDENT') {
      throw new BadRequestException('User must have STUDENT role before creating profile');
    }

    const existing = await this.studentsRepository.findByUserId(userId);
    if (existing) {
      throw new ConflictException('Student profile already exists');
    }

    await this.prisma.$transaction(async tx => {
      const createdStudent = await tx.student.create({
        data: {
          userId,
          code: input.code ?? undefined,
          metadata:
            input.metadata !== undefined ? serializePrismaJson(input.metadata) : undefined
        }
      });

      await this.applyParentOperationsTransactional(tx, createdStudent.id, {
        linkExistingParents: input.linkExistingParents,
        createParents: input.createParents
      });
    });

    return this.getProfileByUserId(userId);
  }

  async updateProfile(userId: string, input: UpdateStudentProfileInput): Promise<StudentProfileDetails> {
    const student = await this.studentsRepository.findByUserId(userId);
    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    await this.prisma.$transaction(async tx => {
      await tx.student.update({
        where: { userId },
        data: {
          code: input.code === undefined ? undefined : input.code,
          metadata:
            input.metadata === undefined
              ? undefined
              : input.metadata === null
              ? Prisma.JsonNull
              : serializePrismaJson(input.metadata)
        }
      });

      await this.applyParentOperationsTransactional(tx, student.id, {
        linkExistingParents: input.linkExistingParents,
        createParents: input.createParents,
        unlinkParents: input.unlinkParents,
        updateParentLinks: input.updateParentLinks
      });
    });

    return this.getProfileByUserId(userId);
  }

  async deleteProfile(userId: string): Promise<void> {
    const student = await this.studentsRepository.findByUserId(userId);
    if (!student) {
      return;
    }

    const parents = await this.parentsService.listParentsByStudent(student.id);
    for (const link of parents) {
      await this.parentsService.unlinkStudent(link.parentId, student.id);
    }

    await this.studentsRepository.deleteByUserId(userId);
  }

  private async applyParentOperationsTransactional(
    tx: Prisma.TransactionClient,
    studentId: string,
    operations: {
      linkExistingParents?: ExistingParentLinkPayload[];
      createParents?: NewParentPayload[];
      unlinkParents?: string[];
      updateParentLinks?: UpdateParentLinkPayload[];
    }
  ) {
    if (operations.createParents) {
      for (const parent of operations.createParents) {
        const hashedPassword = await bcrypt.hash(parent.password, 10);
        const phoneNumber = this.normalizePhoneNumber(parent.phone);
        const dateOfBirth = this.parseDateOfBirth(parent.dateOfBirth);
        const parentUser = await tx.user.create({
          data: {
            email: parent.email,
            username: parent.username,
            password: hashedPassword,
            displayName: parent.displayName,
            role: 'PARENT',
            status: parent.status ?? 'active',
            metadata:
              parent.metadata !== undefined ? serializePrismaJson(parent.metadata) : undefined,
            phoneNumber: phoneNumber === undefined ? undefined : phoneNumber,
            dateOfBirth
          }
        });

        const parentRecord = await tx.parent.create({
          data: {
            userId: parentUser.id,
            phone: phoneNumber ?? null,
            secondaryEmail: parent.secondaryEmail,
            address: parent.address,
            notes: parent.notes,
            metadata:
              parent.metadata !== undefined ? serializePrismaJson(parent.metadata) : undefined
          }
        });

        await tx.parentStudentLink.create({
          data: {
            parentId: parentRecord.id,
            studentId,
            relationship: parent.relationship,
            isPrimary: parent.isPrimary ?? false,
            status: parent.status ?? 'active',
            invitedAt: parent.status === 'invited' ? new Date() : undefined,
            linkedAt: new Date(),
            metadata:
              parent.metadata !== undefined ? serializePrismaJson(parent.metadata) : undefined
          }
        });
      }
    }

    if (operations.linkExistingParents) {
      for (const parent of operations.linkExistingParents) {
        await tx.parentStudentLink.upsert({
          where: {
            parentId_studentId: {
              parentId: parent.parentId,
              studentId
            }
          },
          update: {
            relationship: parent.relationship ?? undefined,
            isPrimary: parent.isPrimary ?? undefined,
            status: parent.status ?? undefined,
            metadata:
              parent.metadata === undefined
                ? undefined
                : serializePrismaJson(parent.metadata)
          },
          create: {
            parentId: parent.parentId,
            studentId,
            relationship: parent.relationship,
            isPrimary: parent.isPrimary ?? false,
            status: parent.status ?? 'active',
            linkedAt: new Date(),
            metadata:
              parent.metadata !== undefined ? serializePrismaJson(parent.metadata) : undefined
          }
        });
      }
    }

    if (operations.updateParentLinks) {
      for (const link of operations.updateParentLinks) {
        await tx.parentStudentLink.update({
          where: {
            parentId_studentId: {
              parentId: link.parentId,
              studentId
            }
          },
          data: {
            relationship: link.relationship ?? undefined,
            isPrimary: link.isPrimary ?? undefined,
            status: link.status ?? undefined,
            metadata:
              link.metadata === undefined
                ? undefined
                : link.metadata === null
                ? Prisma.JsonNull
                : serializePrismaJson(link.metadata)
          }
        });
      }
    }

    if (operations.unlinkParents) {
      for (const parentId of operations.unlinkParents) {
        await tx.parentStudentLink.deleteMany({
          where: {
            parentId,
            studentId
          }
        });
      }
    }
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
