import { Injectable } from '@nestjs/common';
import { User as PrismaUser, Prisma } from '@prisma/client';

import { PaginatedResult } from '@app/common/types/pagination';
import { normalizePagination } from '@app/common/utils/pagination.util';
import { serializePrismaJson, mapPrismaJson } from '@app/common/utils/prisma-json.util';
import { PrismaService } from '@app/infrastructure/database';

import { User } from '../../domain/entities/user.entity';
import {
  CreateUserInput,
  SearchUsersFilters,
  UpdateUserInput,
  UsersRepository
} from '../../domain/repositories/users.repository';

@Injectable()
export class PrismaUsersRepository extends UsersRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: CreateUserInput): Promise<User> {
    const record = await this.prisma.user.create({
      data: {
        email: input.email,
        password: input.password,
        displayName: input.displayName,
        roles: input.roles,
        status: input.status ?? 'active',
        metadata: serializePrismaJson(input.metadata)
      }
    });

    return this.map(record);
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const record = await this.prisma.user.update({
      where: { id },
      data: {
        displayName: input.displayName,
        password: input.password,
        roles: input.roles,
        status: input.status,
        metadata: input.metadata !== undefined ? serializePrismaJson(input.metadata) : undefined
      }
    });

    return this.map(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id }
    });
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { id }
    });

    return record ? this.map(record) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email }
    });

    return record ? this.map(record) : null;
  }

  async search(filters?: SearchUsersFilters): Promise<PaginatedResult<User>> {
    const where: Prisma.UserWhereInput = {};

    if (filters?.query) {
      where.OR = [
        { email: { contains: filters.query } },
        { displayName: { contains: filters.query } }
      ];
    }

    if (filters?.roles && filters.roles.length > 0) {
      where.roles = { array_contains: filters.roles };
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const { page, limit, skip } = normalizePagination(filters?.page, filters?.limit);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.user.count({ where })
    ]);

    return {
      items: items.map(record => this.map(record)),
      total,
      page,
      limit
    };
  }

  private map(record: PrismaUser): User {
    return {
      id: record.id,
      email: record.email,
      displayName: record.displayName,
      roles: Array.isArray(record.roles) ? (record.roles as string[]) : [],
      status: record.status as User['status'],
      metadata: mapPrismaJson(record.metadata),
      passwordHash: record.password
    };
  }
}
