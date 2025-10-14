import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '@app/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@app/modules/auth/infrastructure/http/jwt-auth.guard';
import { RolesGuard } from '@app/modules/auth/infrastructure/http/roles.guard';

import { TeachersService } from '../../application/services/teachers.service';
import { TeacherProfileResponseDto } from './dto/teacher-profile-response.dto';
import { CreateTeacherUserDto } from './dto/create-teacher-user.dto';

@ApiTags('admin-teachers')
@Controller({
  path: 'admin/teachers',
  version: '1'
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class TeacherUsersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user with teacher profile' })
  async createTeacherUser(@Body() dto: CreateTeacherUserDto) {
    const teacher = await this.teachersService.createTeacherUser(dto);
    return TeacherProfileResponseDto.fromDomain(teacher);
  }
}
