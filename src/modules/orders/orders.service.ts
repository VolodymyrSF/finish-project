import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from '../repository/services/orders.repository';
import { UserEntity } from '../../database/entities/user.entity';
import { Status } from '../../database/entities/enums/order-status.enum';
import { ManagerRepository } from '../repository/services/manager.repository';
import { BaseCommentDto } from './dto/base-comment.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { applyOrderUpdateMapping } from '../../helpers/order-update.mapper';
import { GroupRepository } from '../repository/services/group.repository';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository,
  private readonly managersRepository: ManagerRepository,
  private readonly groupRepository: GroupRepository,
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
      author: user.name,
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

  async updateOrder(id: number, dto: UpdateOrderDto, user: UserEntity) {
    const order = await this.ordersRepository.findOne({
      where: { id: id.toString() },
      relations: ['manager', 'group'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.manager && order.manager.id !== user.id) {
      throw new ForbiddenException('You do not have permission to update this order');
    }

    if (dto.groupName) {
      let group = await this.groupRepository.findOne({ where: { name: dto.groupName } });
      if (!group) {
        group = this.groupRepository.create({ name: dto.groupName, description: '' });
        group = await this.groupRepository.save(group);
      }
      order.group = group;
    }

    applyOrderUpdateMapping(order, dto);

    return await this.ordersRepository.save(order);
  }
}
