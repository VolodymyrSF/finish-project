import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GroupIdOnlyDto {
  @ApiProperty()
  @Expose()
  id: string;
}
