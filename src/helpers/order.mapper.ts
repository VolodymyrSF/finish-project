import { plainToInstance } from 'class-transformer';
import { OrderResponseDto } from '../modules/orders/dto/res/order.response.dto';
import { OrderEntity } from '../database/entities/orders.entity';

export function mapOrderToResponse(order: OrderEntity): OrderResponseDto {
  const dto = plainToInstance(OrderResponseDto, order, {
    excludeExtraneousValues: true,
  });

  dto.createdAt = order.created_at;

  dto.updatedAt = order.updated_at;

  return dto;
}
