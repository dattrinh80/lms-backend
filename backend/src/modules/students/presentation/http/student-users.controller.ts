import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '@app/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@app/modules/auth/infrastructure/http/jwt-auth.guard';
import { RolesGuard } from '@app/modules/auth/infrastructure/http/roles.guard';

import { StudentsService } from '../../application/services/students.service';
import { StudentProfileResponseDto } from './dto/student-profile-response.dto';
import { CreateStudentUserDto } from './dto/create-student-user.dto';

@ApiTags('admin-students')
@Controller({
  path: 'admin/students',
  version: '1'
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class StudentUsersController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user with student profile' })
  async createStudentUser(@Body() dto: CreateStudentUserDto) {
    const result = await this.studentsService.createStudentUser(dto);
    return StudentProfileResponseDto.fromDomain(result.student, result.parents);
  }
}
