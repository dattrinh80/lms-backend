import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PaginatedResult } from '@app/common/types/pagination';

import { User } from '@app/modules/identity/domain/entities/user.entity';
import { UsersRepository } from '@app/modules/identity/domain/repositories/users.repository';

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
  displayName: string;
  password: string;
  phone?: string;
  secondaryEmail?: string;
  address?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  status?: User['status'];
  students?: CreateParentStudentLinkInput[];
}

export interface UpdateParentInput {
  displayName?: string;
  status?: User['status'];
  password?: string;
  phone?: string | null;
  secondaryEmail?: string | null;
  address?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

@Injectable()
export class ParentsService {
  constructor(
    private readonly parentsRepository: ParentsRepository,
    private readonly usersRepository: UsersRepository
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

    const user = await this.usersRepository.create({
      email: input.email,
      displayName: input.displayName,
      password: hashedPassword,
      roles: ['PARENT'],
      status: input.status ?? 'active',
      metadata: input.metadata
    });

    const parent = await this.parentsRepository.create({
      userId: user.id,
      phone: input.phone,
      secondaryEmail: input.secondaryEmail,
      address: input.address,
      notes: input.notes,
      metadata: input.metadata
    });

    if (input.students && input.students.length > 0) {
      for (const student of input.students) {
        await this.parentsRepository.linkStudent(parent.id, {
          studentId: student.studentId,
          relationship: student.relationship,
          isPrimary: student.isPrimary,
          status: student.status,
          metadata: student.metadata
        });
      }
    }

    return this.findById(parent.id, true);
  }

  async update(id: string, input: UpdateParentInput): Promise<Parent> {
    const parent = await this.findById(id, false);

    let user: User | null = null;
    if (input.displayName !== undefined || input.status !== undefined || input.password) {
      const hashedPassword = input.password ? await bcrypt.hash(input.password, 10) : undefined;
      user = await this.usersRepository.update(parent.userId, {
        displayName: input.displayName,
        status: input.status,
        password: hashedPassword
      });
    }

    const updated = await this.parentsRepository.update(id, {
      phone: input.phone === undefined ? undefined : input.phone,
      secondaryEmail: input.secondaryEmail === undefined ? undefined : input.secondaryEmail,
      address: input.address === undefined ? undefined : input.address,
      notes: input.notes === undefined ? undefined : input.notes,
      metadata: input.metadata === undefined ? undefined : input.metadata
    });

    if (user) {
      updated.user = {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        status: user.status
      };
    }

    return this.findById(updated.id, true);
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
}
