import { plainToInstance } from 'class-transformer';
import { OrderResponseDto } from '../modules/orders/dto/res/order.response.dto';
import { OrderEntity } from '../database/entities/orders.entity';

export function mapOrderToResponse(order: OrderEntity): OrderResponseDto {
  return plainToInstance(OrderResponseDto, order, {
    excludeExtraneousValues: true,
  });
}
