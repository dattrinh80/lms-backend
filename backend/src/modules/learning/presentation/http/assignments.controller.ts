import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AssignmentsService } from '../../application/services/assignments.service';

@ApiTags('assignments')
@Controller({
  path: 'assignments',
  version: '1'
})
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all assignments' })
  async listAssignments() {
    return this.assignmentsService.listAssignments();
  }
}
