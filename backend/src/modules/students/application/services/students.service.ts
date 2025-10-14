import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { Student } from '../../domain/entities/student.entity';
import {
  CreateStudentInput,
  StudentsRepository,
  UpdateStudentInput
} from '../../domain/repositories/students.repository';
import { ParentsService, CreateParentInput } from '@app/modules/parents/application/services/parents.service';
import { ParentStudentLink } from '@app/modules/parents/domain/entities/parent-student-link.entity';
import { UsersRepository } from '@app/modules/identity/domain/repositories/users.repository';
import { PrismaService } from '@app/infrastructure/database';
import { serializePrismaJson } from '@app/common/utils/prisma-json.util';
import { User } from '@app/modules/identity/domain/entities/user.entity';

export interface ExistingParentLinkPayload {
  parentId: string;
  relationship?: string;
  isPrimary?: boolean;
  status?: ParentStudentLink['status'];
  metadata?: Record<string, unknown>;
}

export interface NewParentPayload {
  email: string;
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
  password: string;
  displayName: string;
  status?: User['status'];
  metadata?: Record<string, unknown>;
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

    const { user, student } = await this.prisma.$transaction(async tx => {
      const createdUser = await tx.user.create({
        data: {
          email: input.user.email,
          password: hashedPassword,
          displayName: input.user.displayName,
          roles: ['STUDENT'],
          status: input.user.status ?? 'active',
          metadata:
            input.user.metadata !== undefined ? serializePrismaJson(input.user.metadata) : undefined
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

      return { user: createdUser, student: createdStudent };
    });

    try {
      await this.applyParentOperations(student.id, {
        linkExistingParents: input.profile.linkExistingParents,
        createParents: input.profile.createParents
      });
    } catch (error) {
      await this.safeCleanupStudentUser(student.id, user.id);
      throw error;
    }

    return this.getProfileByUserId(user.id);
  }

  async createProfile(userId: string, input: CreateStudentProfileInput): Promise<StudentProfileDetails> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.roles.includes('STUDENT')) {
      throw new BadRequestException('User must have STUDENT role before creating profile');
    }

    const existing = await this.studentsRepository.findByUserId(userId);
    if (existing) {
      throw new ConflictException('Student profile already exists');
    }

    const student = await this.studentsRepository.create(this.toCreateInput(userId, input));

    await this.applyParentOperations(student.id, {
      linkExistingParents: input.linkExistingParents,
      createParents: input.createParents
    });

    return this.getProfileByUserId(userId);
  }

  async updateProfile(userId: string, input: UpdateStudentProfileInput): Promise<StudentProfileDetails> {
    const student = await this.studentsRepository.findByUserId(userId);
    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    await this.studentsRepository.updateByUserId(
      userId,
      this.toUpdateInput(input)
    );

    await this.applyParentOperations(student.id, {
      linkExistingParents: input.linkExistingParents,
      createParents: input.createParents,
      unlinkParents: input.unlinkParents,
      updateParentLinks: input.updateParentLinks
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

  private toCreateInput(userId: string, input: CreateStudentProfileInput): CreateStudentInput {
    return {
      userId,
      code: input.code ?? undefined,
      metadata: input.metadata
    };
  }

  private toUpdateInput(input: UpdateStudentProfileInput): UpdateStudentInput {
    return {
      code: input.code === undefined ? undefined : input.code,
      metadata: input.metadata === undefined ? undefined : input.metadata
    };
  }

  private async applyParentOperations(
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
        const payload: CreateParentInput = {
          email: parent.email,
          displayName: parent.displayName,
          password: parent.password,
          phone: parent.phone,
          secondaryEmail: parent.secondaryEmail,
          address: parent.address,
          notes: parent.notes,
          metadata: parent.metadata,
          students: [
            {
              studentId,
              relationship: parent.relationship,
              isPrimary: parent.isPrimary,
              status: parent.status ?? 'active',
              metadata: parent.metadata
            }
          ]
        };

        await this.parentsService.create(payload);
      }
    }

    if (operations.linkExistingParents) {
      for (const parent of operations.linkExistingParents) {
        await this.parentsService.linkStudent(parent.parentId, {
          studentId,
          relationship: parent.relationship,
          isPrimary: parent.isPrimary,
          status: parent.status ?? 'active',
          metadata: parent.metadata
        });
      }
    }

    if (operations.updateParentLinks) {
      for (const link of operations.updateParentLinks) {
        await this.parentsService.updateLink(link.parentId, studentId, {
          relationship: link.relationship ?? undefined,
          isPrimary: link.isPrimary ?? undefined,
          status: link.status ?? undefined,
          metadata: link.metadata ?? undefined
        });
      }
    }

    if (operations.unlinkParents) {
      for (const parentId of operations.unlinkParents) {
        await this.parentsService.unlinkStudent(parentId, studentId);
      }
    }
  }

  private async safeCleanupStudentUser(studentId: string, userId: string) {
    await this.prisma.parentStudentLink.deleteMany({
      where: {
        studentId
      }
    });

    await this.prisma.student
      .delete({
        where: { id: studentId }
      })
      .catch(() => undefined);

    await this.prisma.user
      .delete({
        where: { id: userId }
      })
      .catch(() => undefined);
  }
}
