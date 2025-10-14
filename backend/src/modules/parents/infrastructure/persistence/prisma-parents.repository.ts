import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Parent as PrismaParent,
  ParentStudentLink as PrismaParentStudentLink,
  Prisma,
  Student as PrismaStudent,
  User as PrismaUser,
  ClassSection as PrismaClassSection,
  Enrollment as PrismaEnrollment
} from '@prisma/client';

import { PaginatedResult } from '@app/common/types/pagination';
import { normalizePagination } from '@app/common/utils/pagination.util';
import { mapPrismaJson, serializePrismaJson } from '@app/common/utils/prisma-json.util';
import { PrismaService } from '@app/infrastructure/database';

import { Parent } from '../../domain/entities/parent.entity';
import {
  ClassSectionSummary,
  ParentSummary,
  ParentStudentLink,
  ParentStudentLinkStatus,
  StudentSummary
} from '../../domain/entities/parent-student-link.entity';
import {
  CreateParentRecordInput,
  LinkStudentInput,
  ParentQueryOptions,
  ParentsRepository,
  SearchParentsFilters,
  UpdateLinkInput,
  UpdateParentRecordInput
} from '../../domain/repositories/parents.repository';

type ParentInclude = Prisma.ParentInclude;

type ParentStudentLinkWithRelations = PrismaParentStudentLink & {
  student: PrismaStudent & {
    user: PrismaUser;
    enrollments: (PrismaEnrollment & {
      classSection: PrismaClassSection;
    })[];
  };
  parent?: PrismaParent & {
    user: PrismaUser;
  };
};

type ParentWithRelations = PrismaParent & {
  user: PrismaUser;
  links?: ParentStudentLinkWithRelations[];
};

const parentStudentLinkInclude: Prisma.ParentStudentLinkInclude = {
  student: {
    include: {
      user: true,
      enrollments: {
        include: {
          classSection: true
        }
      }
    }
  }
};

const DEFAULT_LINK_STATUS: ParentStudentLinkStatus = 'active';

@Injectable()
export class PrismaParentsRepository extends ParentsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: CreateParentRecordInput): Promise<Parent> {
    const record = await this.prisma.parent.create({
      data: {
        userId: input.userId,
        phone: input.phone,
        secondaryEmail: input.secondaryEmail,
        address: input.address,
        notes: input.notes,
        metadata: serializePrismaJson(input.metadata)
      },
      include: this.buildInclude({ includeStudents: true, onlyActiveLinks: true })
    });

    return this.map(record as ParentWithRelations);
  }

  async update(id: string, input: UpdateParentRecordInput): Promise<Parent> {
    const record = await this.prisma.parent.update({
      where: { id },
      data: {
        phone: input.phone === null ? null : input.phone ?? undefined,
        secondaryEmail:
          input.secondaryEmail === null ? null : input.secondaryEmail ?? undefined,
        address: input.address === null ? null : input.address ?? undefined,
        notes: input.notes === null ? null : input.notes ?? undefined,
        metadata:
          input.metadata === null
            ? Prisma.JsonNull
            : input.metadata !== undefined
            ? serializePrismaJson(input.metadata)
            : undefined
      },
      include: this.buildInclude({ includeStudents: true })
    });

    return this.map(record as ParentWithRelations);
  }

  async findById(id: string, options?: ParentQueryOptions): Promise<Parent | null> {
    const record = await this.prisma.parent.findUnique({
      where: { id },
      include: this.buildInclude(options)
    });

    return record ? this.map(record as ParentWithRelations, options) : null;
  }

  async findByUserId(userId: string, options?: ParentQueryOptions): Promise<Parent | null> {
    const record = await this.prisma.parent.findUnique({
      where: { userId },
      include: this.buildInclude(options)
    });

    return record ? this.map(record as ParentWithRelations, options) : null;
  }

  async search(filters?: SearchParentsFilters): Promise<PaginatedResult<Parent>> {
    const where: Prisma.ParentWhereInput = {};

    if (filters?.query) {
      where.OR = [
        { user: { email: { contains: filters.query } } },
        { user: { displayName: { contains: filters.query } } },
        { phone: { contains: filters.query } }
      ];
    }

    if (filters?.studentId) {
      where.links = {
        some: {
          studentId: filters.studentId,
          status: { not: 'revoked' }
        }
      };
    }

    if (filters?.status) {
      where.user = {
        status: filters.status
      };
    }

    const { page, limit, skip } = normalizePagination(filters?.page, filters?.limit);

    const include = this.buildInclude({
      includeStudents: filters?.includeStudents ?? false,
      onlyActiveLinks: filters?.includeStudents ?? false
    });

    const [records, total] = await this.prisma.$transaction([
      this.prisma.parent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include
      }),
      this.prisma.parent.count({ where })
    ]);

    return {
      items: records.map(record =>
        this.map(record as ParentWithRelations, {
          includeStudents: filters?.includeStudents,
          onlyActiveLinks: filters?.includeStudents
        })
      ),
      page,
      limit,
      total
    };
  }

  async linkStudent(parentId: string, input: LinkStudentInput): Promise<ParentStudentLink> {
    const parent = await this.prisma.parent.findUnique({ where: { id: parentId } });
    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    const link = await this.prisma.parentStudentLink.upsert({
      where: {
        parentId_studentId: {
          parentId,
          studentId: input.studentId
        }
      },
      update: {
        relationship: input.relationship,
        isPrimary: input.isPrimary ?? false,
        status: input.status ?? DEFAULT_LINK_STATUS,
        invitedAt: input.invitedAt,
        linkedAt: input.linkedAt ?? new Date(),
        revokedAt: input.status === 'revoked' ? new Date() : null,
        metadata: serializePrismaJson(input.metadata)
      },
      create: {
        parentId,
        studentId: input.studentId,
        relationship: input.relationship,
        isPrimary: input.isPrimary ?? false,
        status: input.status ?? DEFAULT_LINK_STATUS,
        invitedAt: input.invitedAt,
        linkedAt: input.linkedAt ?? new Date(),
        metadata: serializePrismaJson(input.metadata)
      },
      include: this.buildLinkInclude()
    });

    return this.mapLink(link as unknown as ParentStudentLinkWithRelations);
  }

  async updateLink(
    parentId: string,
    studentId: string,
    input: UpdateLinkInput
  ): Promise<ParentStudentLink> {
    const link = await this.prisma.parentStudentLink.update({
      where: {
        parentId_studentId: {
          parentId,
          studentId
        }
      },
      data: {
        relationship: input.relationship ?? undefined,
        isPrimary: input.isPrimary ?? undefined,
        status: input.status ?? undefined,
        revokedAt:
          input.status === 'revoked'
            ? input.revokedAt ?? new Date()
            : input.revokedAt === null
            ? null
            : undefined,
        metadata:
          input.metadata !== undefined
            ? serializePrismaJson(input.metadata ?? undefined)
            : undefined
      },
      include: this.buildLinkInclude()
    });

    return this.mapLink(link as unknown as ParentStudentLinkWithRelations);
  }

  async unlinkStudent(parentId: string, studentId: string): Promise<void> {
    await this.prisma.parentStudentLink.update({
      where: {
        parentId_studentId: {
          parentId,
          studentId
        }
      },
      data: {
        status: 'revoked',
        revokedAt: new Date()
      }
    });
  }

  async listLinks(
    parentId: string,
    options?: { onlyActive?: boolean }
  ): Promise<ParentStudentLink[]> {
    const where: Prisma.ParentStudentLinkWhereInput = {
      parentId
    };

    if (options?.onlyActive) {
      where.status = 'active';
    }

    const links = await this.prisma.parentStudentLink.findMany({
      where,
      orderBy: { linkedAt: 'desc' },
      include: this.buildLinkInclude()
    });

    return links.map(link => this.mapLink(link as unknown as ParentStudentLinkWithRelations));
  }

  async listByStudentId(
    studentId: string,
    options?: { onlyActive?: boolean }
  ): Promise<ParentStudentLink[]> {
    const where: Prisma.ParentStudentLinkWhereInput = {
      studentId
    };

    if (options?.onlyActive) {
      where.status = 'active';
    }

    const links = await this.prisma.parentStudentLink.findMany({
      where,
      orderBy: { linkedAt: 'desc' },
      include: this.buildLinkInclude({ includeParent: true })
    });

    return links.map(link => this.mapLink(link as unknown as ParentStudentLinkWithRelations));
  }

  private buildInclude(options?: ParentQueryOptions): ParentInclude | undefined {
    if (!options?.includeStudents) {
      return {
        user: true
      };
    }

    return {
      user: true,
      links: {
        where: options.onlyActiveLinks
          ? {
              status: {
                not: 'revoked'
              }
            }
          : undefined,
        include: this.buildLinkInclude(),
        orderBy: {
          linkedAt: 'desc'
        }
      }
    };
  }

  private buildLinkInclude(options?: { includeParent?: boolean }): Prisma.ParentStudentLinkInclude {
    const include: Prisma.ParentStudentLinkInclude = {
      student: {
        include: {
          user: true,
          enrollments: {
            include: {
              classSection: true
            }
          }
        }
      }
    };

    if (options?.includeParent) {
      include.parent = {
        include: {
          user: true
        }
      };
    }

    return include;
  }

  private map(
    record: ParentWithRelations,
    options?: ParentQueryOptions
  ): Parent {
    const parent: Parent = {
      id: record.id,
      userId: record.userId,
      phone: record.phone ?? undefined,
      secondaryEmail: record.secondaryEmail ?? undefined,
      address: record.address ?? undefined,
      notes: record.notes ?? undefined,
      metadata: mapPrismaJson(record.metadata),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      user: {
        id: record.user.id,
        email: record.user.email,
        displayName: record.user.displayName,
        status: record.user.status as Parent['user']['status']
      }
    };

    if (options?.includeStudents && record.links) {
      parent.links = record.links.map(link => this.mapLink(link));
    }

    return parent;
  }

  private mapLink(link: ParentStudentLinkWithRelations): ParentStudentLink {
    return {
      id: link.id,
      parentId: link.parentId,
      studentId: link.studentId,
      relationship: link.relationship ?? undefined,
      isPrimary: link.isPrimary,
      status: link.status as ParentStudentLinkStatus,
      invitedAt: link.invitedAt ?? undefined,
      linkedAt: link.linkedAt,
      revokedAt: link.revokedAt ?? undefined,
      metadata: mapPrismaJson(link.metadata),
      student: this.mapStudent(link.student),
      parent: link.parent ? this.mapParent(link.parent) : undefined
    };
  }

  private mapStudent(student: ParentStudentLinkWithRelations['student']): StudentSummary {
    return {
      id: student.id,
      code: student.code,
      displayName: student.user.displayName,
      email: student.user.email,
      status: student.user.status as StudentSummary['status'],
      classSections: student.enrollments.map(
        enrollment =>
          ({
            id: enrollment.classSection.id,
            code: enrollment.classSection.code,
            name: enrollment.classSection.name
          }) satisfies ClassSectionSummary
      )
    };
  }

  private mapParent(
    parent: NonNullable<ParentStudentLinkWithRelations['parent']>
  ): ParentSummary {
    return {
      id: parent.id,
      email: parent.user.email,
      displayName: parent.user.displayName,
      phone: parent.phone,
      secondaryEmail: parent.secondaryEmail ?? undefined
    };
  }
}
