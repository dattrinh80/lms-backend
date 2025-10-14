import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateSessionDto } from './dto/create-session.dto';
import { ListSchedulesQueryDto } from './dto/list-schedules-query.dto';
import { SchedulingService } from '../../application/services/scheduling.service';
import { ScheduleFilters } from '../../domain/repositories/sessions.repository';

@ApiTags('scheduling')
@Controller({
  path: 'schedules',
  version: '1'
})
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Get()
  @ApiOperation({ summary: 'List sessions with optional filters' })
  async listSchedules(@Query() query: ListSchedulesQueryDto) {
    const filters: ScheduleFilters = {
      classSectionId: query.classSectionId,
      classSubjectId: query.classSubjectId,
      teacherId: query.teacherId,
      studentId: query.studentId,
      from: query.from,
      to: query.to
    };

    return this.schedulingService.listSchedules(filters);
  }

  @Post()
  @ApiOperation({ summary: 'Create a teaching session' })
  async createSession(@Body() dto: CreateSessionDto) {
    const schedule = await this.schedulingService.createSession({
      classSubjectId: dto.classSubjectId,
      teacherId: dto.teacherId,
      roomId: dto.roomId,
      startsAt: new Date(dto.startsAt),
      endsAt: new Date(dto.endsAt),
      recurrenceId: dto.recurrenceId
    });

    return schedule;
  }
}
