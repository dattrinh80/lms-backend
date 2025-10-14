import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GradingService } from '../../application/services/grading.service';

@ApiTags('grading')
@Controller({
  path: 'grading',
  version: '1'
})
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}

  @Get('assignments/:assignmentId')
  async listGrades(@Param('assignmentId') assignmentId: string) {
    return this.gradingService.listGradesByAssignment(assignmentId);
  }
}
