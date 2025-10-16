import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { Teacher } from '../../domain/entities/teacher.entity';
import { TeachersRepository } from '../../domain/repositories/teachers.repository';
import { PrismaService } from '@app/infrastructure/database';
import { serializePrismaJson } from '@app/common/utils/prisma-json.util';
import { User } from '@app/modules/identity/domain/entities/user.entity';
import { UsersRepository } from '@app/modules/identity/domain/repositories/users.repository';
import { Prisma } from '@prisma/client';

export interface CreateTeacherProfileInput {
  bio?: string | null;
  metadata?: Record<string, unknown>;
}

export interface UpdateTeacherProfileInput {
  bio?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface CreateTeacherUserAccountInput {
  email: string;
  username: string;
  password: string;
  displayName: string;
  status?: User['status'];
  metadata?: Record<string, unknown>;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
}

export interface CreateTeacherUserInput {
  user: CreateTeacherUserAccountInput;
  profile: CreateTeacherProfileInput;
}

@Injectable()
export class TeachersService {
  constructor(
    private readonly teachersRepository: TeachersRepository,
    private readonly usersRepository: UsersRepository,
    private readonly prisma: PrismaService
  ) {}

  async getProfileByUserId(userId: string): Promise<Teacher> {
    const teacher = await this.teachersRepository.findByUserId(userId);
    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }
    return teacher;
  }

  async createProfile(userId: string, input: CreateTeacherProfileInput): Promise<Teacher> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'TEACHER') {
      throw new BadRequestException('User must have TEACHER role before creating profile');
    }

    const existing = await this.teachersRepository.findByUserId(userId);
    if (existing) {
      throw new ConflictException('Teacher profile already exists');
    }

    await this.prisma.teacher.create({
      data: {
        userId,
        bio: input.bio ?? undefined,
        metadata:
          input.metadata !== undefined ? serializePrismaJson(input.metadata) : undefined
      }
    });

    return this.getProfileByUserId(userId);
  }

  async updateProfile(userId: string, input: UpdateTeacherProfileInput): Promise<Teacher> {
    const teacher = await this.teachersRepository.findByUserId(userId);
    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    await this.prisma.teacher.update({
      where: { userId },
      data: {
        bio: input.bio === undefined ? undefined : input.bio,
        metadata:
          input.metadata === undefined
            ? undefined
            : input.metadata === null
            ? Prisma.JsonNull
            : serializePrismaJson(input.metadata)
      }
    });

    return this.getProfileByUserId(userId);
  }

  async deleteProfile(userId: string): Promise<void> {
    const teacher = await this.teachersRepository.findByUserId(userId);
    if (!teacher) {
      return;
    }

    await this.teachersRepository.deleteByUserId(userId);
  }

  async createTeacherUser(input: CreateTeacherUserInput): Promise<Teacher> {
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
          role: 'TEACHER',
          status: input.user.status ?? 'active',
          metadata:
            input.user.metadata !== undefined ? serializePrismaJson(input.user.metadata) : undefined,
          phoneNumber: phoneNumber === undefined ? undefined : phoneNumber,
          dateOfBirth
        }
      });

      await tx.teacher.create({
        data: {
          userId: createdUser.id,
          bio: input.profile.bio ?? undefined,
          metadata:
            input.profile.metadata !== undefined
              ? serializePrismaJson(input.profile.metadata)
              : undefined
        }
      });

      return createdUser.id;
    });

    return this.getProfileByUserId(userId);
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
