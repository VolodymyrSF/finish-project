import { UpdateOrderDto } from '../modules/orders/dto/update-order.dto';
import { OrderEntity } from '../database/entities/orders.entity';

export function applyOrderUpdateMapping(
  order: OrderEntity,
  dto: UpdateOrderDto,
  excludedFields: string[] = []
): OrderEntity {
  const { groupName, ...fieldsToUpdate } = dto;
  Object.entries(fieldsToUpdate).forEach(([key, value]) => {
    if (value !== undefined && !excludedFields.includes(key)) {
      order[key] = value;
    }
  });
  return order;
}

