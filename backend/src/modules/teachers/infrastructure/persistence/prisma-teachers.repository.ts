import { Injectable } from '@nestjs/common';
import { Prisma, Teacher as PrismaTeacher, User as PrismaUser } from '@prisma/client';

import { mapPrismaJson, serializePrismaJson } from '@app/common/utils/prisma-json.util';
import { PrismaService } from '@app/infrastructure/database';

import { Teacher, TeacherUserSummary } from '../../domain/entities/teacher.entity';
import {
  CreateTeacherInput,
  TeachersRepository,
  UpdateTeacherInput
} from '../../domain/repositories/teachers.repository';

type TeacherWithUser = PrismaTeacher & { user: PrismaUser };

@Injectable()
export class PrismaTeachersRepository extends TeachersRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: CreateTeacherInput): Promise<Teacher> {
    const record = (await this.prisma.teacher.create({
      data: {
        userId: input.userId,
        bio: input.bio ?? undefined,
        metadata: serializePrismaJson(input.metadata)
      },
      include: {
        user: true
      }
    })) as TeacherWithUser;

    return this.map(record);
  }

  async updateByUserId(userId: string, input: UpdateTeacherInput): Promise<Teacher> {
    const record = (await this.prisma.teacher.update({
      where: { userId },
      data: {
        bio: input.bio ?? undefined,
        metadata:
          input.metadata === null
            ? Prisma.JsonNull
            : input.metadata !== undefined
            ? serializePrismaJson(input.metadata)
            : undefined
      },
      include: {
        user: true
      }
    })) as TeacherWithUser;

    return this.map(record);
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.teacher.delete({
      where: { userId }
    });
  }

  async findByUserId(userId: string): Promise<Teacher | null> {
    const record = await this.prisma.teacher.findUnique({
      where: { userId },
      include: {
        user: true
      }
    });

    return record ? this.map(record as TeacherWithUser) : null;
  }

  async findById(id: string): Promise<Teacher | null> {
    const record = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    return record ? this.map(record as TeacherWithUser) : null;
  }

  private map(record: TeacherWithUser): Teacher {
    return {
      id: record.id,
      userId: record.userId,
      bio: record.bio,
      metadata: mapPrismaJson(record.metadata),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      user: this.mapUser(record.user)
    };
  }

  private mapUser(user: PrismaUser): TeacherUserSummary {
    const roles = Array.isArray(user.roles) ? (user.roles as string[]) : [];

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles,
      status: user.status as TeacherUserSummary['status']
    };
  }
}
