import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../repository/services/orders.repository';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async getOrders(
    page: number,
    limit: number,
    orderBy: string,
    order: 'ASC' | 'DESC',
  ) {
    const [orders, total] = await this.ordersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { [orderBy]: order },
    });

    const totalPages = Math.ceil(total / limit);

    return { orders, total, totalPages };
  }
}
