import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrdersRepository } from '../repository/services/orders.repository';
import { UserEntity } from '../../database/entities/user.entity';
import { Status } from '../../database/entities/enums/order-status.enum';
import { ManagerRepository } from '../repository/services/manager.repository';
import { BaseCommentDto } from './dto/res/base-comment.dto';
import { UpdateOrderDto } from './dto/req/update-order.dto';
import { applyOrderUpdateMapping } from '../../helpers/order-update.mapper';
import { GroupRepository } from '../repository/services/group.repository';
import { FilterOrdersDto } from './dto/req/filter-orders.dto';
import { ManagerEntity } from '../../database/entities/manager.entity';
import { OrderEntity } from '../../database/entities/orders.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { handleGroup } from '../../helpers/handleGroup';
import { assignManagerIfMissing } from '../../helpers/assignManagerIfMissing';
import { runInTransaction } from '../../utils/run-in-transaction';
import { buildOrderFilterObject } from '../../helpers/buildOrderFilterObject';
import { mapOrderToResponse } from '../../helpers/order.mapper';9
import { OrderResponseDto } from './dto/res/order.response.dto';
import { PaginatedOrdersResponseDto } from './dto/res/paginated-orders.res.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository,
  @InjectDataSource() private readonly dataSource: DataSource,
  private readonly managersRepository: ManagerRepository,
  private readonly groupRepository: GroupRepository,
) {}

  async getOrders(
    page: number,
    limit: number,
    orderBy: string,
    order: 'ASC' | 'DESC',
  ): Promise<{ orders: OrderResponseDto[]; total: number; totalPages: number }> {
    const [orders, total] = await this.ordersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { [orderBy]: order },
      relations: ['manager', 'group'],
    });

    const transformed = orders.map(mapOrderToResponse);
    return {
      orders: transformed,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async addCommentToOrder(
    orderId: number,
    comment: string,
    user: UserEntity,
  ): Promise<{ comment: BaseCommentDto; status: Status; manager: string }> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId.toString() },
      relations: ['manager'],
    });

    if (!order) throw new NotFoundException('Заявки не знайдено');

    if (order.status === null || order.status === Status.New) {
      order.status = Status.InWork;
    }

    await assignManagerIfMissing(order, user, this.managersRepository);

    order.comments ??= [];
    const newComment: BaseCommentDto = {
      text: comment,
      author: user.name,
      createdAt: new Date(),
    };

    order.comments.push(newComment);
    await this.ordersRepository.save(order);

    return {
      comment: newComment,
      status: order.status,
      manager: order.manager.name,
    };
  }

  async updateOrder(id: number, dto: UpdateOrderDto, user: UserEntity): Promise<OrderResponseDto> {
    return runInTransaction(this.dataSource, async (manager) => {
      const order = await manager.findOne(OrderEntity, {
        where: { id: id.toString() },
        relations: ['manager', 'group'],
      });

      if (!order) throw new NotFoundException('Заявки не знайдено');

      if (dto.status === Status.New) {
        order.status = Status.New;
      } else {
        if (order.manager && order.manager.userId !== user.id) {
          throw new ForbiddenException('У вас немає прав для цієї заявки');
        }

        if (!order.manager) {
          const managerEntity = await manager.findOne(ManagerEntity, {
            where: { email: user.email },
          });
          if (!managerEntity) {
            throw new NotFoundException('Користувач не є менеджером');
          }
          order.manager = managerEntity;
        }
      }

      if (dto.groupName !== undefined) {
        if (dto.groupName === null || dto.groupName === '') {
          order.group = null;
        } else {
          const group = await handleGroup(dto, manager);
          order.group = group || null;
        }
      }

      applyOrderUpdateMapping(order, dto, ['GroupDescription']);
      const updatedOrder = await manager.save(order);

      return mapOrderToResponse(updatedOrder);
    });
  }

  async getFilteredOrders(
    filters: FilterOrdersDto,
    user: UserEntity,
  ): Promise<PaginatedOrdersResponseDto> {
    const where = buildOrderFilterObject(filters, user);
    const [orders, total] = await this.ordersRepository.findAndCount({
      where,
      skip: (filters.page - 1) * 25,
      take: 25,
      order: { [filters.orderBy]: filters.order },
      relations: ['manager', 'group'],
    });


    return {
      orders: orders.map(mapOrderToResponse),
      total,
      totalPages: Math.ceil(total / 25),
    };
  }
  async getAllFilteredOrders(
    filters: FilterOrdersDto,
    user: UserEntity,
  ): Promise<OrderEntity[]> {
    const where = buildOrderFilterObject(filters, user);
    return this.ordersRepository.find({
      where,
      order: { [filters.orderBy]: filters.order },
      relations: ['manager', 'group'],
    });
  }

}