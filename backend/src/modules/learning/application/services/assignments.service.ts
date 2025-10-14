import { Injectable } from '@nestjs/common';

import { Assignment } from '../../domain/entities/assignment.entity';

@Injectable()
export class AssignmentsService {
  async listAssignments(): Promise<Assignment[]> {
    return [];
  }
}
