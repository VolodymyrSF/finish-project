import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrdersRepository } from '../repository/services/orders.repository';
import { UserEntity } from '../../database/entities/user.entity';
import { Status } from '../../database/entities/enums/order-status.enum';
import { ManagerRepository } from '../repository/services/manager.repository';
import { BaseCommentDto } from './dto/base-comment.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { applyOrderUpdateMapping } from '../../helpers/order-update.mapper';
import { GroupRepository } from '../repository/services/group.repository';
import { UpdateStatus } from '../../database/entities/enums/update-status.enum';
import { Equal, FindOptionsWhere, Like } from 'typeorm';
import { FilterOrdersDto } from './dto/filter-orders.dto';
import { ManagerResponseDto } from './dto/manager.res.dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import { GroupEntity } from '../../database/entities/group.entity';
import { ManagerEntity } from '../../database/entities/manager.entity';
import { OrderEntity } from '../../database/entities/orders.entity';
import { InjectDataSource } from '@nestjs/typeorm';

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
      throw new NotFoundException('Заявки не знайдено');
    }

    if (order.status === null || order.status === Status.New) {
      order.status = Status.InWork;
    }

    if (!order.manager) {
      const manager = await this.managersRepository.findOne({ where: { email: user.email } });
      if (!manager) {
        throw new NotFoundException('Користувач не є менеджером');
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
    return await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(OrderEntity, {
        where: { id: id.toString() },
        relations: ['manager', 'group'],
      });

      if (!order) {
        throw new NotFoundException('Заявки не знайдено');
      }

      if (order.manager && order.manager.id !== user.id) {
        throw new ForbiddenException('У вас немає прав для цієї заявки');
      } else {
        const managerEntity = await manager.findOne(ManagerEntity, { where: { email: user.email } });
        if (!managerEntity) {
          throw new NotFoundException('Користувач не є менеджером');
        }
        order.manager = managerEntity;
      }


      if (dto.groupName) {
        let group = await manager.findOne(GroupEntity, { where: { name: dto.groupName } });
        if (!group) {

          group = manager.create(GroupEntity, {
            name: dto.groupName,
            description: dto.GroupDescription ?? 'Створено автоматично',
          });
          group = await manager.save(group);
        } else if (dto.GroupDescription !== undefined) {

          group.description = dto.GroupDescription;
          group = await manager.save(group);
        }
        order.group = group;
      }

      applyOrderUpdateMapping(order, dto, ['GroupDescription']);

      const updatedOrder = await manager.save(order);

      return {
        ...updatedOrder,
        manager: plainToInstance(ManagerResponseDto, updatedOrder.manager, {
          excludeExtraneousValues: true,
        }),
      };
    });
  }


  async getFilteredOrders(filters: FilterOrdersDto, user: UserEntity) {

    const where: FindOptionsWhere<any> = {};

    const textFields = ['name', 'surname', 'email', 'phone', 'course', 'course_format', 'course_type','utm','msg'];
    textFields.forEach(field => {
      if (filters[field]) {
        where[field] = Like(`%${filters[field]}%`);
      }
    });

    const numberFields = ['age', 'sum', 'id'];
    numberFields.forEach(field => {
      if (filters[field] !== undefined) {
        where[field] = filters[field];
      }
    });

    if (filters.status) {
      if (!Object.values(UpdateStatus).includes(filters.status as UpdateStatus)) {
        throw new BadRequestException(`Invalid status: ${filters.status}. Allowed values: ${Object.values(UpdateStatus).join(', ')}`);
      }
      where.status = Equal(filters.status as Status | null);

    }

    if (filters.onlyMy) {
      where.manager = { id: user.id };
    }

    const orders = await this.ordersRepository.find({
      where,
      relations: ['manager', 'group'],
    });
    return orders.map(order => ({
      ...order,
      manager: order.manager ? {
        id: order.manager.id,
        name: order.manager.name,
        surname: order.manager.surname,
        email: order.manager.email,
        phone: order.manager.phone,
      } : null,
      group: order.group ? {
        id: order.group.id,
        name: order.group.name,
      } : null,
    }));
    //return orders;
  }

}
