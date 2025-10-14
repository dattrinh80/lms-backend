import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { AddClassSubjectDto } from './dto/add-class-subject.dto';
import {
  ClassSectionResponseDto,
  ClassSubjectResponseDto
} from './dto/class-section-response.dto';
import { CreateClassSectionDto } from './dto/create-class-section.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomResponseDto } from './dto/room-response.dto';
import { ClassesService } from '../../application/services/classes.service';
import {
  ClassSectionListFilters,
  CreateClassSectionInput,
  UpdateClassSectionInput
} from '../../domain/repositories/class-sections.repository';

@ApiTags('classes')
@Controller({
  path: 'classes',
  version: '1'
})
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a class section with optional subjects' })
  async create(@Body() dto: CreateClassSectionDto): Promise<ClassSectionResponseDto> {
    const classSection = await this.classesService.createClassSection(this.toCreateInput(dto));
    return ClassSectionResponseDto.fromDomain(classSection);
  }

  @Get()
  @ApiOperation({ summary: 'List class sections' })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'teacherId', required: false })
  @ApiQuery({ name: 'subjectId', required: false })
  async list(
    @Query('query') query?: string,
    @Query('teacherId') teacherId?: string,
    @Query('subjectId') subjectId?: string
  ): Promise<ClassSectionResponseDto[]> {
    const filters: ClassSectionListFilters = {
      query: query || undefined,
      teacherId: teacherId || undefined,
      subjectId: subjectId || undefined
    };

    const results = await this.classesService.listClassSections(filters);
    return results.map(classSection => ClassSectionResponseDto.fromDomain(classSection));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get class section detail' })
  async get(@Param('id') id: string): Promise<ClassSectionResponseDto> {
    const classSection = await this.classesService.getClassSection(id);
    return ClassSectionResponseDto.fromDomain(classSection);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update class section information' })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateClassSectionDto>
  ): Promise<ClassSectionResponseDto> {
    const updateInput: UpdateClassSectionInput = {
      name: dto.name,
      level: dto.level,
      capacity: dto.capacity,
      homeroomTeacherId: dto.homeroomTeacherId,
      campusId: dto.campusId,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined
    };

    const updated = await this.classesService.updateClassSection(id, updateInput);
    return ClassSectionResponseDto.fromDomain(updated);
  }

  @Post(':id/subjects')
  @ApiOperation({ summary: 'Assign a subject to a class section' })
  async addSubject(
    @Param('id') classSectionId: string,
    @Body() dto: AddClassSubjectDto
  ): Promise<ClassSubjectResponseDto> {
    const classSubject = await this.classesService.addSubjectToClassSection(classSectionId, dto);
    return ClassSubjectResponseDto.fromDomain(classSubject);
  }

  @Get(':id/subjects')
  @ApiOperation({ summary: 'List subjects assigned to a class section' })
  async listSubjects(@Param('id') classSectionId: string): Promise<ClassSubjectResponseDto[]> {
    const subjects = await this.classesService.listSubjectsForClassSection(classSectionId);
    return subjects.map(subject => ClassSubjectResponseDto.fromDomain(subject));
  }

  @Delete(':classId/subjects/:classSubjectId')
  @ApiOperation({ summary: 'Remove a subject from a class section' })
  async removeSubject(
    @Param('classId') classSectionId: string,
    @Param('classSubjectId') classSubjectId: string
  ) {
    await this.classesService.removeSubjectFromClassSection(classSectionId, classSubjectId);
  }

  @Post('rooms')
  @ApiOperation({ summary: 'Create a teaching room' })
  async createRoom(@Body() dto: CreateRoomDto): Promise<RoomResponseDto> {
    const room = await this.classesService.createRoom(dto);
    return RoomResponseDto.fromDomain(room);
  }

  @Get('rooms/list')
  @ApiOperation({ summary: 'List available rooms' })
  async listRooms(): Promise<RoomResponseDto[]> {
    const rooms = await this.classesService.listRooms();
    return rooms.map(room => RoomResponseDto.fromDomain(room));
  }

  private toCreateInput(dto: CreateClassSectionDto): CreateClassSectionInput {
    return {
      code: dto.code,
      name: dto.name,
      level: dto.level,
      capacity: dto.capacity,
      homeroomTeacherId: dto.homeroomTeacherId,
      campusId: dto.campusId,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      subjects: dto.subjects?.map(subject => ({
        subjectId: subject.subjectId,
        leadTeacherId: subject.leadTeacherId,
        weeklySessions: subject.weeklySessions,
        creditHours: subject.creditHours
      }))
    };
  }

}
