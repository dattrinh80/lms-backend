import { Injectable } from '@nestjs/common';
import { Room as PrismaRoom } from '@prisma/client';

import { mapPrismaJson, serializePrismaJson } from '@app/common/utils/prisma-json.util';
import { PrismaService } from '@app/infrastructure/database';

import { Room } from '../../domain/entities/room.entity';
import { RoomsRepository } from '../../domain/repositories/class-sections.repository';

@Injectable()
export class PrismaRoomsRepository extends RoomsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(room: Omit<Room, 'id'>): Promise<Room> {
    const record = await this.prisma.room.create({
      data: {
        name: room.name,
        location: room.location,
        capacity: room.capacity,
        metadata: serializePrismaJson(room.metadata)
      }
    });

    return this.map(record);
  }

  async findAll(): Promise<Room[]> {
    const records = await this.prisma.room.findMany({ orderBy: { name: 'asc' } });
    return records.map(record => this.map(record));
  }

  async findById(id: string): Promise<Room | null> {
    const record = await this.prisma.room.findUnique({ where: { id } });
    return record ? this.map(record) : null;
  }

  private map(record: PrismaRoom): Room {
    return {
      id: record.id,
      name: record.name,
      location: record.location ?? undefined,
      capacity: record.capacity ?? undefined,
      metadata: mapPrismaJson(record.metadata)
    };
  }
}
