import { ApiProperty } from '@nestjs/swagger';

import { Room } from '../../../domain/entities/room.entity';

export class RoomResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  location?: string;

  @ApiProperty({ required: false })
  capacity?: number;

  static fromDomain(room: Room): RoomResponseDto {
    const dto = new RoomResponseDto();
    dto.id = room.id;
    dto.name = room.name;
    dto.location = room.location;
    dto.capacity = room.capacity;
    return dto;
  }
}
