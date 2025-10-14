import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@app/infrastructure/database';

import {
  ParentDashboardOverview,
  ParentDashboardStudentOverview,
  ParentPortalAttendanceRecord,
  ParentPortalGradeSummary,
  ParentPortalInvoiceSummary,
  ParentPortalScheduleItem,
  ParentPortalStudentSummary
} from '../dto/parent-portal.dto';
import { ParentsService } from './parents.service';

interface ScheduleFilters {
  from?: Date;
  to?: Date;
  limit?: number;
}

interface AttendanceFilters {
  from?: Date;
  to?: Date;
  limit?: number;
}

interface GradesFilters {
  limit?: number;
}

@Injectable()
export class ParentPortalService {
  constructor(
    private readonly parentsService: ParentsService,
    private readonly prisma: PrismaService
  ) {}

  async getDashboard(userId: string): Promise<ParentDashboardOverview> {
    const parent = await this.parentsService.findByUserId(userId, true);
    const students = parent.links ?? [];

    const overviews: ParentDashboardStudentOverview[] = [];

    for (const link of students) {
      if (!link.student || link.status === 'revoked') {
        continue;
      }

      const [upcomingSessions, latestGrades, attendanceSummary, outstandingAmount] =
        await Promise.all([
          this.fetchSchedule(link.studentId, { from: new Date(), limit: 5 }),
          this.fetchGrades(link.studentId, { limit: 5 }),
          this.computeAttendanceSummary(link.studentId),
          this.computeOutstandingAmount(link.studentId)
        ]);

      overviews.push({
        student: this.mapStudentSummary(link),
        upcomingSessions,
        latestGrades,
        attendanceSummary,
        outstandingAmount
      });
    }

    return {
      parentId: parent.id,
      displayName: parent.user.displayName,
      students: overviews
    };
  }

  async listLinkedStudents(userId: string): Promise<ParentPortalStudentSummary[]> {
    const parent = await this.parentsService.findByUserId(userId, true);
    const links = parent.links ?? [];

    return links
      .filter(link => link.student)
      .map(link => this.mapStudentSummary(link));
  }

  async getStudentSchedule(
    userId: string,
    studentId: string,
    filters?: ScheduleFilters
  ): Promise<ParentPortalScheduleItem[]> {
    await this.ensureStudentAccess(userId, studentId);
    return this.fetchSchedule(studentId, filters);
  }

  async getStudentAttendance(
    userId: string,
    studentId: string,
    filters?: AttendanceFilters
  ): Promise<ParentPortalAttendanceRecord[]> {
    await this.ensureStudentAccess(userId, studentId);
    return this.fetchAttendance(studentId, filters);
  }

  async getStudentGrades(
    userId: string,
    studentId: string,
    filters?: GradesFilters
  ): Promise<ParentPortalGradeSummary[]> {
    await this.ensureStudentAccess(userId, studentId);
    return this.fetchGrades(studentId, filters);
  }

  async getStudentInvoices(
    userId: string,
    studentId: string
  ): Promise<ParentPortalInvoiceSummary[]> {
    await this.ensureStudentAccess(userId, studentId);
    return this.fetchInvoices(studentId);
  }

  private async ensureStudentAccess(userId: string, studentId: string) {
    const parent = await this.parentsService.findByUserId(userId, true);
    const link = (parent.links ?? []).find(
      item => item.studentId === studentId && item.status !== 'revoked'
    );

    if (!link) {
      throw new NotFoundException('Student not linked to parent');
    }
  }

  private mapStudentSummary(link: {
    studentId: string;
    relationship?: string;
    isPrimary: boolean;
    status: string;
    student?: {
      id: string;
      code?: string | null;
      displayName: string;
      email: string;
      status: 'active' | 'inactive' | 'invited';
      classSections: { id: string; code: string; name: string }[];
    };
  }): ParentPortalStudentSummary {
    return {
      studentId: link.studentId,
      studentCode: link.student?.code ?? undefined,
      displayName: link.student?.displayName ?? '',
      email: link.student?.email ?? '',
      relationship: link.relationship,
      isPrimary: link.isPrimary,
      status: link.status as ParentPortalStudentSummary['status'],
      classSections: link.student?.classSections ?? []
    };
  }

  private async fetchSchedule(
    studentId: string,
    filters?: ScheduleFilters
  ): Promise<ParentPortalScheduleItem[]> {
    const classSubjectFilter: Prisma.ClassSubjectWhereInput = {
      classSection: {
        enrollments: {
          some: {
            studentId,
            status: 'active'
          }
        }
      }
    };

    const where: Prisma.SessionWhereInput = {
      classSubject: {
        is: classSubjectFilter
      }
    };

    if (filters?.from || filters?.to) {
      where.startsAt = {};
      if (filters?.from) {
        where.startsAt.gte = filters.from;
      }
      if (filters?.to) {
        where.startsAt.lte = filters.to;
      }
    }

    const sessions = await this.prisma.session.findMany({
      where,
      orderBy: { startsAt: 'asc' },
      take: filters?.limit,
      include: {
        classSubject: {
          include: {
            subject: true,
            classSection: true,
            leadTeacher: {
              include: {
                user: true
              }
            }
          }
        },
        teacher: {
          include: {
            user: true
          }
        },
        room: true
      }
    });

    return sessions.map(
      session =>
        ({
          sessionId: session.id,
          classSectionId: session.classSubject.classSectionId,
          subjectId: session.classSubject.subjectId,
          subjectName: session.classSubject.subject.name,
          classSectionName: session.classSubject.classSection.name,
          teacherId: session.teacherId ?? session.classSubject.leadTeacherId ?? undefined,
          teacherName:
            session.teacher?.user.displayName ??
            session.classSubject.leadTeacher?.user.displayName ??
            undefined,
          roomId: session.roomId ?? undefined,
          roomName: session.room?.name ?? undefined,
          startsAt: session.startsAt,
          endsAt: session.endsAt
        }) satisfies ParentPortalScheduleItem
    );
  }

  private async fetchAttendance(
    studentId: string,
    filters?: AttendanceFilters
  ): Promise<ParentPortalAttendanceRecord[]> {
    const where: Prisma.AttendanceRecordWhereInput = {
      studentId
    };

    const sessionFilter: Prisma.SessionWhereInput = {};
    const startsAtFilter: Prisma.DateTimeFilter = {};

    if (filters?.from) {
      startsAtFilter.gte = filters.from;
    }

    if (filters?.to) {
      startsAtFilter.lte = filters.to;
    }

    if (Object.keys(startsAtFilter).length > 0) {
      sessionFilter.startsAt = startsAtFilter;
    }

    if (Object.keys(sessionFilter).length > 0) {
      where.session = {
        is: sessionFilter
      };
    }

    const records = await this.prisma.attendanceRecord.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
      take: filters?.limit,
      include: {
        session: {
          include: {
            classSubject: {
              include: {
                subject: true,
                classSection: true
              }
            },
            teacher: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    return records.map(
      record =>
        ({
          id: record.id,
          status: record.status,
          note: record.note ?? undefined,
          recordedAt: record.recordedAt,
          session: {
            id: record.sessionId,
            startsAt: record.session.startsAt,
            endsAt: record.session.endsAt,
            subjectName: record.session.classSubject.subject.name,
            classSectionName: record.session.classSubject.classSection.name,
            teacherName: record.session.teacher?.user.displayName ?? undefined
          }
        }) satisfies ParentPortalAttendanceRecord
    );
  }

  private async fetchGrades(
    studentId: string,
    filters?: GradesFilters
  ): Promise<ParentPortalGradeSummary[]> {
    const grades = await this.prisma.grade.findMany({
      where: {
        submission: {
          studentId
        }
      },
      orderBy: { gradedAt: 'desc' },
      take: filters?.limit,
      include: {
        submission: {
          include: {
            assignment: {
              include: {
                classSubject: {
                  include: {
                    subject: true,
                    classSection: true,
                    leadTeacher: {
                      include: {
                        user: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    return grades.map(
      grade =>
        ({
          gradeId: grade.id,
          assignmentId: grade.submission.assignmentId,
          assignmentTitle: grade.submission.assignment.title,
          score: grade.score,
          maxScore: grade.maxScore,
          gradedAt: grade.gradedAt,
          subjectName: grade.submission.assignment.classSubject.subject.name,
          classSectionName: grade.submission.assignment.classSubject.classSection.name,
          teacherName:
            grade.submission.assignment.classSubject.leadTeacher?.user.displayName ?? undefined
        }) satisfies ParentPortalGradeSummary
    );
  }

  private async fetchInvoices(studentId: string): Promise<ParentPortalInvoiceSummary[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { studentId },
      orderBy: { issuedAt: 'desc' },
      include: {
        lines: true,
        payments: true
      }
    });

    return invoices.map(
      invoice =>
        ({
          invoiceId: invoice.id,
          period: invoice.period,
          status: invoice.status,
          totalAmount: invoice.totalAmount,
          outstandingAmount: invoice.outstandingAmount,
          issuedAt: invoice.issuedAt,
          dueDate: invoice.dueDate ?? undefined,
          lines: invoice.lines.map(line => ({
            item: line.item,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            subtotal: line.subtotal
          })),
          payments: invoice.payments.map(payment => ({
            amount: payment.amount,
            method: payment.method,
            paidAt: payment.paidAt,
            txRef: payment.txRef ?? undefined
          }))
        }) satisfies ParentPortalInvoiceSummary
    );
  }

  private async computeAttendanceSummary(studentId: string) {
    const grouped = await this.prisma.attendanceRecord.groupBy({
      by: ['status'],
      where: {
        studentId
      },
      _count: {
        status: true
      }
    });

    const total = grouped.reduce((sum, item) => sum + item._count.status, 0);

    return {
      total,
      present: grouped.find(item => item.status === 'present')?._count.status ?? 0,
      absent: grouped.find(item => item.status === 'absent')?._count.status ?? 0,
      late: grouped.find(item => item.status === 'late')?._count.status ?? 0
    };
  }

  private async computeOutstandingAmount(studentId: string): Promise<number> {
    const result = await this.prisma.invoice.aggregate({
      where: {
        studentId,
        outstandingAmount: {
          gt: 0
        }
      },
      _sum: {
        outstandingAmount: true
      }
    });

    return result._sum.outstandingAmount ?? 0;
  }
}
