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
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { buildPaginatedResponse } from '@app/common/utils/pagination.util';
import { JwtAuthGuard } from '@app/modules/auth/infrastructure/http/jwt-auth.guard';
import { RolesGuard } from '@app/modules/auth/infrastructure/http/roles.guard';

import { Roles } from '@app/common/decorators/roles.decorator';
import { ParentResponseDto } from './dto/parent-response.dto';
import { ParentStudentLinkResponseDto } from './dto/parent-student-link-response.dto';
import { CreateParentDto } from './dto/create-parent.dto';
import { ListParentsQueryDto } from './dto/list-parents-query.dto';
import { LinkParentStudentDto } from './dto/link-parent-student.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { UpdateParentStudentLinkDto } from './dto/update-parent-student-link.dto';
import { ParentsService } from '../../application/services/parents.service';

@ApiTags('admin-parents')
@Controller({
  path: 'admin/parents',
  version: '1'
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get()
  @ApiOperation({ summary: 'List parents' })
  async list(@Query() query: ListParentsQueryDto) {
    const result = await this.parentsService.search({
      query: query.query,
      studentId: query.studentId,
      status: query.status,
      page: query.page,
      limit: query.limit,
      includeStudents: query.includeStudents
    });

    return buildPaginatedResponse(result, parent => ParentResponseDto.fromDomain(parent));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get parent details' })
  async getById(@Param('id') id: string) {
    const parent = await this.parentsService.findById(id, true);
    return ParentResponseDto.fromDomain(parent);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new parent' })
  async create(@Body() dto: CreateParentDto) {
    const parent = await this.parentsService.create(dto);
    return ParentResponseDto.fromDomain(parent);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update parent information' })
  async update(@Param('id') id: string, @Body() dto: UpdateParentDto) {
    const parent = await this.parentsService.update(id, dto);
    return ParentResponseDto.fromDomain(parent);
  }

  @Post(':id/students')
  @ApiOperation({ summary: 'Link parent to a student' })
  async linkStudent(@Param('id') id: string, @Body() dto: LinkParentStudentDto) {
    const link = await this.parentsService.linkStudent(id, dto);
    return ParentStudentLinkResponseDto.fromDomain(link);
  }

  @Patch(':id/students/:studentId')
  @ApiOperation({ summary: 'Update parent-student link' })
  async updateLink(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
    @Body() dto: UpdateParentStudentLinkDto
  ) {
    const link = await this.parentsService.updateLink(id, studentId, dto);
    return ParentStudentLinkResponseDto.fromDomain(link);
  }

  @Delete(':id/students/:studentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unlink parent from student' })
  async unlinkStudent(@Param('id') id: string, @Param('studentId') studentId: string) {
    await this.parentsService.unlinkStudent(id, studentId);
  }
}
