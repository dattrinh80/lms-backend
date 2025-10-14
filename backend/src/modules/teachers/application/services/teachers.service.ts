import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { Teacher } from '../../domain/entities/teacher.entity';
import {
  CreateTeacherInput,
  TeachersRepository,
  UpdateTeacherInput
} from '../../domain/repositories/teachers.repository';
import { UsersRepository } from '@app/modules/identity/domain/repositories/users.repository';
import { PrismaService } from '@app/infrastructure/database';
import { serializePrismaJson } from '@app/common/utils/prisma-json.util';
import { User } from '@app/modules/identity/domain/entities/user.entity';

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
  password: string;
  displayName: string;
  status?: User['status'];
  metadata?: Record<string, unknown>;
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

    if (!user.roles.includes('TEACHER')) {
      throw new BadRequestException('User must have TEACHER role before creating profile');
    }

    const existing = await this.teachersRepository.findByUserId(userId);
    if (existing) {
      throw new ConflictException('Teacher profile already exists');
    }

    return this.teachersRepository.create(this.toCreateInput(userId, input));
  }

  async updateProfile(userId: string, input: UpdateTeacherProfileInput): Promise<Teacher> {
    const teacher = await this.teachersRepository.findByUserId(userId);
    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    return this.teachersRepository.updateByUserId(userId, this.toUpdateInput(input));
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

    const { user } = await this.prisma.$transaction(async tx => {
      const createdUser = await tx.user.create({
        data: {
          email: input.user.email,
          password: hashedPassword,
          displayName: input.user.displayName,
          roles: ['TEACHER'],
          status: input.user.status ?? 'active',
          metadata:
            input.user.metadata !== undefined ? serializePrismaJson(input.user.metadata) : undefined
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

      return { user: createdUser };
    });

    return this.getProfileByUserId(user.id);
  }

  private toCreateInput(userId: string, input: CreateTeacherProfileInput): CreateTeacherInput {
    return {
      userId,
      bio: input.bio ?? undefined,
      metadata: input.metadata
    };
  }

  private toUpdateInput(input: UpdateTeacherProfileInput): UpdateTeacherInput {
    return {
      bio: input.bio === undefined ? undefined : input.bio,
      metadata: input.metadata === undefined ? undefined : input.metadata
    };
  }
}
