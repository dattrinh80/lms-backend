import { ApiProperty } from '@nestjs/swagger';

export class SubjectResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  defaultDurationMinutes?: number;
}
