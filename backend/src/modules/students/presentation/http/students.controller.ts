import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '@app/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@app/modules/auth/infrastructure/http/jwt-auth.guard';
import { RolesGuard } from '@app/modules/auth/infrastructure/http/roles.guard';

import { StudentsService } from '../../application/services/students.service';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { StudentProfileResponseDto } from './dto/student-profile-response.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';

@ApiTags('admin-students')
@Controller({
  path: 'admin/users/:userId/student-profile',
  version: '1'
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get student profile by user id' })
  async getProfile(@Param('userId') userId: string) {
    const result = await this.studentsService.getProfileByUserId(userId);
    return StudentProfileResponseDto.fromDomain(result.student, result.parents);
  }

  @Post()
  @ApiOperation({ summary: 'Create student profile and link parents' })
  async createProfile(
    @Param('userId') userId: string,
    @Body() dto: CreateStudentProfileDto
  ) {
    const result = await this.studentsService.createProfile(userId, dto);
    return StudentProfileResponseDto.fromDomain(result.student, result.parents);
  }

  @Patch()
  @ApiOperation({ summary: 'Update student profile and parent links' })
  async updateProfile(
    @Param('userId') userId: string,
    @Body() dto: UpdateStudentProfileDto
  ) {
    const result = await this.studentsService.updateProfile(userId, dto);
    return StudentProfileResponseDto.fromDomain(result.student, result.parents);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete student profile and detach parents' })
  async deleteProfile(@Param('userId') userId: string) {
    await this.studentsService.deleteProfile(userId);
  }
}
