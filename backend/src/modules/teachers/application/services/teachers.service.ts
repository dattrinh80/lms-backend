import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';

import { Teacher } from '../../domain/entities/teacher.entity';
import {
  CreateTeacherInput,
  TeachersRepository,
  UpdateTeacherInput
} from '../../domain/repositories/teachers.repository';
import { UsersRepository } from '@app/modules/identity/domain/repositories/users.repository';

export interface CreateTeacherProfileInput {
  bio?: string | null;
  metadata?: Record<string, unknown>;
}

export interface UpdateTeacherProfileInput {
  bio?: string | null;
  metadata?: Record<string, unknown> | null;
}

@Injectable()
export class TeachersService {
  constructor(
    private readonly teachersRepository: TeachersRepository,
    private readonly usersRepository: UsersRepository
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
