import { Injectable, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from '../repository/services/orders.repository';
import { UserEntity } from '../../database/entities/user.entity';
import { Status } from '../../database/entities/enums/order-status.enum';
import { ManagerRepository } from '../repository/services/manager.repository';
import { BaseCommentDto } from './dto/base-comment.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository,
  private readonly managersRepository: ManagerRepository, // додаємо репозиторій менеджерів
) {}

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
      relations: ['manager', 'group'],
    });

    const transformedOrders = orders.map(order => ({
      ...order,
      manager: order.manager ? order.manager.name : null,
      group: order.group ? order.group.name : null,
    }));

    const totalPages = Math.ceil(total / limit);

    return { orders: transformedOrders, total, totalPages };
  }

  async addCommentToOrder(
    orderId: number,
    comment: string,
    user: UserEntity,
  ):  Promise<{ comment: BaseCommentDto; status: Status; manager: string }> {
    const order = await this.ordersRepository.findOne({ where: { id: orderId.toString() } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === null || order.status === Status.New) {
      order.status = Status.InWork;
    }

    if (!order.manager) {
      const manager = await this.managersRepository.findOne({ where: { email: user.email } });
      if (!manager) {
        throw new NotFoundException('Current user is not a manager');
      }
      order.manager = manager;
    }

    if (!order.comments) {
      order.comments = [];
    }
    const newComment = {
      text: comment,
      author: user.name,  // Прізвище користувача
      createdAt: new Date(),
    };

    order.comments.push(newComment);

    await this.ordersRepository.save(order);

    return {
      comment: newComment as BaseCommentDto,
      status: order.status,
      manager: order.manager.name,
    };
  }

}
