import { Injectable } from '@nestjs/common';
import {
  ClassSection as PrismaClassSection,
  ClassSubject as PrismaClassSubject,
  Prisma,
  Subject as PrismaSubject
} from '@prisma/client';

import { mapPrismaJson, serializePrismaJson } from '@app/common/utils/prisma-json.util';
import { PrismaService } from '@app/infrastructure/database';

import { Subject } from '../../../curriculum/domain/entities/subject.entity';
import { ClassSection } from '../../domain/entities/class-section.entity';
import { ClassSubject } from '../../domain/entities/class-subject.entity';
import {
  ClassSectionListFilters,
  ClassSectionsRepository,
  CreateClassSectionInput,
  CreateClassSubjectInput,
  UpdateClassSectionInput
} from '../../domain/repositories/class-sections.repository';

type ClassSectionWithSubjects = PrismaClassSection & {
  classSubjects: (PrismaClassSubject & { subject: PrismaSubject })[];
};

@Injectable()
export class PrismaClassSectionsRepository extends ClassSectionsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: CreateClassSectionInput): Promise<ClassSection> {
    const record = (await this.prisma.classSection.create({
      data: {
        code: input.code,
        name: input.name,
        level: input.level,
        capacity: input.capacity,
        homeroomTeacherId: input.homeroomTeacherId,
        campusId: input.campusId,
        metadata: serializePrismaJson(input.metadata),
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
        classSubjects: input.subjects
          ? {
              create: input.subjects.map(subject =>
                ({
                  subjectId: subject.subjectId,
                  leadTeacherId: subject.leadTeacherId,
                  weeklySessions: subject.weeklySessions ?? null,
                  creditHours: subject.creditHours ?? null,
                  status: subject.status ?? 'active',
                  metadata: serializePrismaJson(subject.metadata)
                } satisfies Prisma.ClassSubjectUncheckedCreateWithoutClassSectionInput)
              )
            }
          : undefined
      },
      include: {
        classSubjects: {
          include: { subject: true }
        }
      }
    })) as ClassSectionWithSubjects;

    return this.mapClassSection(record);
  }

  async update(id: string, input: UpdateClassSectionInput): Promise<ClassSection> {
    const record = (await this.prisma.classSection.update({
      where: { id },
      data: {
        name: input.name,
        level: input.level,
        capacity: input.capacity,
        homeroomTeacherId: input.homeroomTeacherId,
        campusId: input.campusId,
        metadata: input.metadata !== undefined ? serializePrismaJson(input.metadata) : undefined,
        startDate: input.startDate ?? undefined,
        endDate: input.endDate ?? undefined
      },
      include: {
        classSubjects: {
          include: { subject: true }
        }
      }
    })) as ClassSectionWithSubjects;

    return this.mapClassSection(record);
  }

  async findById(id: string): Promise<ClassSection | null> {
    const record = await this.prisma.classSection.findUnique({
      where: { id },
      include: {
        classSubjects: { include: { subject: true } }
      }
    });

    return record ? this.mapClassSection(record) : null;
  }

  async findByCode(code: string): Promise<ClassSection | null> {
    const record = await this.prisma.classSection.findUnique({
      where: { code },
      include: {
        classSubjects: { include: { subject: true } }
      }
    });

    return record ? this.mapClassSection(record) : null;
  }

  async findAll(filters?: ClassSectionListFilters): Promise<ClassSection[]> {
    const where: Prisma.ClassSectionWhereInput = {};

    if (filters?.query) {
      where.OR = [
        { code: { contains: filters.query } },
        { name: { contains: filters.query } }
      ];
    }

    if (filters?.teacherId) {
      where.OR = [
        ...(where.OR ?? []),
        { homeroomTeacherId: filters.teacherId },
        {
          classSubjects: {
            some: {
              leadTeacherId: filters.teacherId
            }
          }
        }
      ];
    }

    if (filters?.subjectId) {
      where.classSubjects = {
        some: { subjectId: filters.subjectId }
      };
    }

    const records = await this.prisma.classSection.findMany({
      where,
      include: {
        classSubjects: { include: { subject: true } }
      },
      orderBy: { code: 'asc' }
    });

    return records.map(
      record => this.mapClassSection(record as ClassSectionWithSubjects)
    );
  }

  async addSubject(
    classSectionId: string,
    input: CreateClassSubjectInput
  ): Promise<ClassSubject> {
    const record = await this.prisma.classSubject.create({
      data: {
        classSectionId,
        subjectId: input.subjectId,
        leadTeacherId: input.leadTeacherId,
        weeklySessions: input.weeklySessions ?? null,
        creditHours: input.creditHours ?? null,
        status: input.status ?? 'active',
        metadata: serializePrismaJson(input.metadata)
      },
      include: { subject: true }
    });

    return this.mapClassSubject(record as PrismaClassSubject & { subject: PrismaSubject });
  }

  async listSubjects(classSectionId: string): Promise<ClassSubject[]> {
    const records = await this.prisma.classSubject.findMany({
      where: { classSectionId },
      include: { subject: true }
    });

    return records.map(record =>
      this.mapClassSubject(record as PrismaClassSubject & { subject: PrismaSubject })
    );
  }

  async removeSubject(classSectionId: string, classSubjectId: string): Promise<void> {
    await this.prisma.classSubject.delete({
      where: { id: classSubjectId, classSectionId }
    });
  }

  private mapClassSection(record: ClassSectionWithSubjects): ClassSection {
    return {
      id: record.id,
      code: record.code,
      name: record.name,
      level: record.level ?? undefined,
      capacity: record.capacity ?? undefined,
      homeroomTeacherId: record.homeroomTeacherId ?? undefined,
      campusId: record.campusId ?? undefined,
      metadata: mapPrismaJson(record.metadata),
      startDate: record.startDate ?? undefined,
      endDate: record.endDate ?? undefined,
      subjects: record.classSubjects.map(classSubject => this.mapClassSubject(classSubject))
    };
  }

  private mapClassSubject(
    record: PrismaClassSubject & { subject?: PrismaSubject }
  ): ClassSubject {
    const subject: Subject | undefined = record.subject
      ? {
          id: record.subject.id,
          code: record.subject.code,
          name: record.subject.name,
          description: record.subject.description ?? undefined,
          defaultDurationMinutes: record.subject.defaultDurationMinutes ?? undefined,
          metadata: mapPrismaJson(record.subject.metadata)
        }
      : undefined;

    return {
      id: record.id,
      classSectionId: record.classSectionId,
      subjectId: record.subjectId,
      leadTeacherId: record.leadTeacherId ?? undefined,
      weeklySessions: record.weeklySessions ?? undefined,
      creditHours: record.creditHours ?? undefined,
      status: record.status ?? undefined,
      metadata: mapPrismaJson(record.metadata),
      subject
    };
  }
}
