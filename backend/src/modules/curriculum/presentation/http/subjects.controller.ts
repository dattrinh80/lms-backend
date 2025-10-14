import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateSubjectDto } from './dto/create-subject.dto';
import { SubjectResponseDto } from './dto/subject-response.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectsService } from '../../application/services/subjects.service';
import { Subject } from '../../domain/entities/subject.entity';

@ApiTags('subjects')
@Controller({
  path: 'subjects',
  version: '1'
})
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subject' })
  async create(@Body() dto: CreateSubjectDto): Promise<SubjectResponseDto> {
    const subject = await this.subjectsService.create(dto);
    return this.toResponse(subject);
  }

  @Get()
  @ApiOperation({ summary: 'List all subjects' })
  async findAll(): Promise<SubjectResponseDto[]> {
    const subjects = await this.subjectsService.findAll();
    return subjects.map(subject => this.toResponse(subject));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subject details' })
  async findOne(@Param('id') id: string): Promise<SubjectResponseDto> {
    const subject = await this.subjectsService.findById(id);
    return this.toResponse(subject);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update subject information' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSubjectDto
  ): Promise<SubjectResponseDto> {
    const subject = await this.subjectsService.update(id, dto);
    return this.toResponse(subject);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete subject' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.subjectsService.delete(id);
  }

  private toResponse(subject: Subject): SubjectResponseDto {
    return {
      id: subject.id,
      code: subject.code,
      name: subject.name,
      description: subject.description,
      defaultDurationMinutes: subject.defaultDurationMinutes
    };
  }
}
