import { Injectable } from '@nestjs/common';
import { Prisma, Session as PrismaSession, Room as PrismaRoom } from '@prisma/client';

import { serializePrismaJson } from '@app/common/utils/prisma-json.util';
import { PrismaService } from '@app/infrastructure/database';

import { Schedule } from '../../domain/entities/schedule.entity';
import {
  CreateSessionInput,
  ScheduleFilters,
  SessionsRepository
} from '../../domain/repositories/sessions.repository';

type SessionWithRelations = PrismaSession & {
  room: PrismaRoom | null;
  classSubject: {
    classSectionId: string;
  };
};

@Injectable()
export class PrismaSessionsRepository extends SessionsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: CreateSessionInput): Promise<Schedule> {
    const record = (await this.prisma.session.create({
      data: {
        classSubjectId: input.classSubjectId,
        teacherId: input.teacherId,
        roomId: input.roomId,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        recurrenceId: input.recurrenceId,
        metadata: serializePrismaJson(input.metadata)
      },
      include: {
        room: true,
        classSubject: {
          select: {
            classSectionId: true
          }
        }
      }
    })) as SessionWithRelations;

    return this.map(record);
  }

  async findById(id: string): Promise<Schedule | null> {
    const record = await this.prisma.session.findUnique({
      where: { id },
      include: {
        room: true,
        classSubject: {
          select: { classSectionId: true }
        }
      }
    });

    return record ? this.map(record) : null;
  }

  async list(filters?: ScheduleFilters): Promise<Schedule[]> {
    const where: Prisma.SessionWhereInput = {};
    const classSubjectWhere: Prisma.ClassSubjectWhereInput = {};

    if (filters?.classSubjectId) {
      where.classSubjectId = filters.classSubjectId;
    }

    if (filters?.classSectionId) {
      classSubjectWhere.classSectionId = filters.classSectionId;
    }

    if (filters?.teacherId) {
      where.teacherId = filters.teacherId;
    }

    if (filters?.studentId) {
      classSubjectWhere.classSection = {
        enrollments: {
          some: {
            studentId: filters.studentId
          }
        }
      };
    }

    if (Object.keys(classSubjectWhere).length > 0) {
      where.classSubject = { is: classSubjectWhere };
    }

    if (filters?.from || filters?.to) {
      where.startsAt = {};
      if (filters.from) {
        where.startsAt.gte = filters.from;
      }
      if (filters.to) {
        where.startsAt.lte = filters.to;
      }
    }

    const records = await this.prisma.session.findMany({
      where,
      orderBy: { startsAt: 'asc' },
      include: {
        room: true,
        classSubject: {
          select: { classSectionId: true }
        }
      }
    });

    return records.map(record => this.map(record as SessionWithRelations));
  }

  private map(record: SessionWithRelations): Schedule {
    return {
      id: record.id,
      classSubjectId: record.classSubjectId,
      teacherId: record.teacherId ?? undefined,
      roomId: record.roomId ?? undefined,
      startsAt: record.startsAt,
      endsAt: record.endsAt,
      recurrenceId: record.recurrenceId ?? undefined,
      classSectionId: record.classSubject.classSectionId,
      roomName: record.room?.name
    };
  }
}
