import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { Subject } from '../../domain/entities/subject.entity';
import {
  CreateSubjectInput,
  SubjectsRepository,
  UpdateSubjectInput
} from '../../domain/repositories/subjects.repository';

@Injectable()
export class SubjectsService {
  constructor(private readonly subjectsRepository: SubjectsRepository) {}

  async create(input: CreateSubjectInput): Promise<Subject> {
    const existing = await this.subjectsRepository.findByCode(input.code);
    if (existing) {
      throw new ConflictException(`Subject code ${input.code} already exists`);
    }

    return this.subjectsRepository.create(input);
  }

  findAll(): Promise<Subject[]> {
    return this.subjectsRepository.findAll();
  }

  async findById(id: string): Promise<Subject> {
    const subject = await this.subjectsRepository.findById(id);
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return subject;
  }

  async update(id: string, input: UpdateSubjectInput): Promise<Subject> {
    await this.findById(id);
    return this.subjectsRepository.update(id, input);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.subjectsRepository.delete(id);
  }
}
