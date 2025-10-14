import { Injectable } from '@nestjs/common';
import { Prisma, Student as PrismaStudent, User as PrismaUser } from '@prisma/client';

import { mapPrismaJson, serializePrismaJson } from '@app/common/utils/prisma-json.util';
import { PrismaService } from '@app/infrastructure/database';

import { Student, StudentUserSummary } from '../../domain/entities/student.entity';
import {
  CreateStudentInput,
  StudentsRepository,
  UpdateStudentInput
} from '../../domain/repositories/students.repository';

type StudentWithUser = PrismaStudent & { user: PrismaUser };

@Injectable()
export class PrismaStudentsRepository extends StudentsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: CreateStudentInput): Promise<Student> {
    const record = (await this.prisma.student.create({
      data: {
        userId: input.userId,
        code: input.code ?? undefined,
        metadata: serializePrismaJson(input.metadata)
      },
      include: {
        user: true
      }
    })) as StudentWithUser;

    return this.map(record);
  }

  async updateByUserId(userId: string, input: UpdateStudentInput): Promise<Student> {
    const record = (await this.prisma.student.update({
      where: { userId },
      data: {
        code: input.code ?? undefined,
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
    })) as StudentWithUser;

    return this.map(record);
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.student.delete({
      where: { userId }
    });
  }

  async findByUserId(userId: string): Promise<Student | null> {
    const record = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        user: true
      }
    });

    return record ? this.map(record as StudentWithUser) : null;
  }

  async findById(id: string): Promise<Student | null> {
    const record = await this.prisma.student.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    return record ? this.map(record as StudentWithUser) : null;
  }

  private map(record: StudentWithUser): Student {
    return {
      id: record.id,
      userId: record.userId,
      code: record.code,
      metadata: mapPrismaJson(record.metadata),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      user: this.mapUser(record.user)
    };
  }

  private mapUser(user: PrismaUser): StudentUserSummary {
    const roles = Array.isArray(user.roles) ? (user.roles as string[]) : [];

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles,
      status: user.status as StudentUserSummary['status']
    };
  }
}
