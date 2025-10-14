import { ConflictException, Injectable } from '@nestjs/common';

import { BaseService } from '@app/common/helpers/base.service';

import { ClassSection } from '../../domain/entities/class-section.entity';
import { ClassSubject } from '../../domain/entities/class-subject.entity';
import { Room } from '../../domain/entities/room.entity';
import {
  ClassSectionListFilters,
  ClassSectionsRepository,
  CreateClassSectionInput,
  CreateClassSubjectInput,
  RoomsRepository,
  UpdateClassSectionInput
} from '../../domain/repositories/class-sections.repository';

@Injectable()
export class ClassesService extends BaseService {
  constructor(
    private readonly classSectionsRepository: ClassSectionsRepository,
    private readonly roomsRepository: RoomsRepository
  ) {
    super();
  }

  async createClassSection(input: CreateClassSectionInput): Promise<ClassSection> {
    const existing = await this.classSectionsRepository.findByCode(input.code);
    if (existing) {
      throw new ConflictException(`Class section code ${input.code} already exists`);
    }

    return this.classSectionsRepository.create(input);
  }

  listClassSections(filters?: ClassSectionListFilters): Promise<ClassSection[]> {
    return this.classSectionsRepository.findAll(filters);
  }

  async getClassSection(id: string): Promise<ClassSection> {
    const classSection = await this.classSectionsRepository.findById(id);
    return this.ensureFound(classSection, 'Class section not found');
  }

  async updateClassSection(id: string, input: UpdateClassSectionInput): Promise<ClassSection> {
    await this.getClassSection(id);
    return this.classSectionsRepository.update(id, input);
  }

  async addSubjectToClassSection(
    classSectionId: string,
    input: CreateClassSubjectInput
  ): Promise<ClassSubject> {
    await this.getClassSection(classSectionId);
    return this.classSectionsRepository.addSubject(classSectionId, input);
  }

  async listSubjectsForClassSection(classSectionId: string): Promise<ClassSubject[]> {
    await this.getClassSection(classSectionId);
    return this.classSectionsRepository.listSubjects(classSectionId);
  }

  async removeSubjectFromClassSection(classSectionId: string, classSubjectId: string): Promise<void> {
    await this.getClassSection(classSectionId);
    await this.classSectionsRepository.removeSubject(classSectionId, classSubjectId);
  }

  createRoom(room: Omit<Room, 'id'>): Promise<Room> {
    return this.roomsRepository.create(room);
  }

  listRooms(): Promise<Room[]> {
    return this.roomsRepository.findAll();
  }

  async getRoom(id: string): Promise<Room> {
    const room = await this.roomsRepository.findById(id);
    return this.ensureFound(room, 'Room not found');
  }
}
