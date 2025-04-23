import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OrderResponseDto } from './order.response.dto';

export class PaginatedOrdersResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  @Type(() => OrderResponseDto)
  orders: OrderResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}