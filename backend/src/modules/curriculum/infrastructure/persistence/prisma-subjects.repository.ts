import { Injectable } from '@nestjs/common';
import { Subject as PrismaSubject } from '@prisma/client';

import { serializePrismaJson, mapPrismaJson } from '@app/common/utils/prisma-json.util';
import { PrismaService } from '@app/infrastructure/database';

import { Subject } from '../../domain/entities/subject.entity';
import {
  CreateSubjectInput,
  SubjectsRepository,
  UpdateSubjectInput
} from '../../domain/repositories/subjects.repository';

@Injectable()
export class PrismaSubjectsRepository extends SubjectsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: CreateSubjectInput): Promise<Subject> {
    const record = await this.prisma.subject.create({
      data: {
        code: input.code,
        name: input.name,
        description: input.description,
        defaultDurationMinutes: input.defaultDurationMinutes ?? null,
        metadata: serializePrismaJson(input.metadata)
      }
    });

    return this.map(record);
  }

  async update(id: string, input: UpdateSubjectInput): Promise<Subject> {
    const record = await this.prisma.subject.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        defaultDurationMinutes: input.defaultDurationMinutes,
        metadata: input.metadata !== undefined ? serializePrismaJson(input.metadata) : undefined
      }
    });

    return this.map(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.subject.delete({ where: { id } });
  }

  async findById(id: string): Promise<Subject | null> {
    const record = await this.prisma.subject.findUnique({ where: { id } });
    return record ? this.map(record) : null;
  }

  async findByCode(code: string): Promise<Subject | null> {
    const record = await this.prisma.subject.findUnique({ where: { code } });
    return record ? this.map(record) : null;
  }

  async findAll(): Promise<Subject[]> {
    const records = await this.prisma.subject.findMany({ orderBy: { name: 'asc' } });
    return records.map(record => this.map(record));
  }

  private map(record: PrismaSubject): Subject {
    return {
      id: record.id,
      code: record.code,
      name: record.name,
      description: record.description ?? undefined,
      defaultDurationMinutes: record.defaultDurationMinutes ?? undefined,
      metadata: mapPrismaJson(record.metadata)
    };
  }
}
