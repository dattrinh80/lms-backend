import {
  Controller,
  Get,
  Param,
  Query,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@app/common/decorators/current-user.decorator';
import { Roles } from '@app/common/decorators/roles.decorator';
import { AuthUser } from '@app/modules/auth/domain/entities/auth-user.entity';
import { JwtAuthGuard } from '@app/modules/auth/infrastructure/http/jwt-auth.guard';
import { RolesGuard } from '@app/modules/auth/infrastructure/http/roles.guard';

import { ParentPortalAttendanceQueryDto } from './dto/parent-portal-attendance-query.dto';
import { ParentPortalAttendanceResponseDto } from './dto/parent-portal-attendance-response.dto';
import { ParentDashboardResponseDto } from './dto/parent-dashboard-response.dto';
import { ParentPortalGradesQueryDto } from './dto/parent-portal-grades-query.dto';
import { ParentPortalGradeResponseDto } from './dto/parent-portal-grade-response.dto';
import { ParentPortalInvoiceResponseDto } from './dto/parent-portal-invoice-response.dto';
import { ParentPortalScheduleQueryDto } from './dto/parent-portal-schedule-query.dto';
import { ParentPortalScheduleResponseDto } from './dto/parent-portal-schedule-response.dto';
import { ParentPortalStudentResponseDto } from './dto/parent-portal-student-response.dto';
import { ParentPortalService } from '../../application/services/parent-portal.service';

@ApiTags('parent-portal')
@Controller({
  path: 'parent',
  version: '1'
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PARENT')
export class ParentPortalController {
  constructor(private readonly parentPortalService: ParentPortalService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard overview for the parent' })
  async getDashboard(@CurrentUser() user: AuthUser | null) {
    const userId = this.resolveUserId(user);
    const overview = await this.parentPortalService.getDashboard(userId);
    return ParentDashboardResponseDto.fromOverview(overview);
  }

  @Get('students')
  @ApiOperation({ summary: 'List students linked to the parent' })
  async listStudents(@CurrentUser() user: AuthUser | null) {
    const userId = this.resolveUserId(user);
    const students = await this.parentPortalService.listLinkedStudents(userId);
    return students.map(student => ParentPortalStudentResponseDto.fromSummary(student));
  }

  @Get('students/:studentId/schedule')
  @ApiOperation({ summary: 'Get student schedule for the selected period' })
  async getStudentSchedule(
    @CurrentUser() user: AuthUser | null,
    @Param('studentId') studentId: string,
    @Query() query: ParentPortalScheduleQueryDto
  ) {
    const userId = this.resolveUserId(user);
    const schedule = await this.parentPortalService.getStudentSchedule(userId, studentId, {
      from: query.from,
      to: query.to,
      limit: query.limit
    });
    return schedule.map(item => ParentPortalScheduleResponseDto.fromItem(item));
  }

  @Get('students/:studentId/attendance')
  @ApiOperation({ summary: 'Get student attendance records' })
  async getStudentAttendance(
    @CurrentUser() user: AuthUser | null,
    @Param('studentId') studentId: string,
    @Query() query: ParentPortalAttendanceQueryDto
  ) {
    const userId = this.resolveUserId(user);
    const attendance = await this.parentPortalService.getStudentAttendance(userId, studentId, {
      from: query.from,
      to: query.to,
      limit: query.limit
    });
    return attendance.map(record => ParentPortalAttendanceResponseDto.fromRecord(record));
  }

  @Get('students/:studentId/grades')
  @ApiOperation({ summary: 'Get student grade summaries' })
  async getStudentGrades(
    @CurrentUser() user: AuthUser | null,
    @Param('studentId') studentId: string,
    @Query() query: ParentPortalGradesQueryDto
  ) {
    const userId = this.resolveUserId(user);
    const grades = await this.parentPortalService.getStudentGrades(userId, studentId, {
      limit: query.limit
    });
    return grades.map(grade => ParentPortalGradeResponseDto.fromSummary(grade));
  }

  @Get('students/:studentId/invoices')
  @ApiOperation({ summary: 'Get student invoices and payments' })
  async getStudentInvoices(
    @CurrentUser() user: AuthUser | null,
    @Param('studentId') studentId: string
  ) {
    const userId = this.resolveUserId(user);
    const invoices = await this.parentPortalService.getStudentInvoices(userId, studentId);
    return invoices.map(invoice => ParentPortalInvoiceResponseDto.fromSummary(invoice));
  }

  private resolveUserId(user: AuthUser | null): string {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    return user.id;
  }
}
