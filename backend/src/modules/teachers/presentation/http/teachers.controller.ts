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

import { TeachersService } from '../../application/services/teachers.service';
import { CreateTeacherProfileDto } from './dto/create-teacher-profile.dto';
import { TeacherProfileResponseDto } from './dto/teacher-profile-response.dto';
import { UpdateTeacherProfileDto } from './dto/update-teacher-profile.dto';

@ApiTags('admin-teachers')
@Controller({
  path: 'admin/users/:userId/teacher-profile',
  version: '1'
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  @ApiOperation({ summary: 'Get teacher profile by user id' })
  async getProfile(@Param('userId') userId: string) {
    const teacher = await this.teachersService.getProfileByUserId(userId);
    return TeacherProfileResponseDto.fromDomain(teacher);
  }

  @Post()
  @ApiOperation({ summary: 'Create teacher profile' })
  async createProfile(
    @Param('userId') userId: string,
    @Body() dto: CreateTeacherProfileDto
  ) {
    const teacher = await this.teachersService.createProfile(userId, dto);
    return TeacherProfileResponseDto.fromDomain(teacher);
  }

  @Patch()
  @ApiOperation({ summary: 'Update teacher profile' })
  async updateProfile(
    @Param('userId') userId: string,
    @Body() dto: UpdateTeacherProfileDto
  ) {
    const teacher = await this.teachersService.updateProfile(userId, dto);
    return TeacherProfileResponseDto.fromDomain(teacher);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete teacher profile' })
  async deleteProfile(@Param('userId') userId: string) {
    await this.teachersService.deleteProfile(userId);
  }
}
