
import { NotFoundException } from '@nestjs/common';
import { OrderEntity } from '../database/entities/orders.entity';
import { UserEntity } from '../database/entities/user.entity';
import { ManagerRepository } from '../modules/repository/services/manager.repository';

export async function assignManagerIfMissing(
  order: OrderEntity,
  user: UserEntity,
  managersRepository: ManagerRepository,
): Promise<void> {
  if (!order.manager) {
    const manager = await managersRepository.findOne({ where: { email: user.email } });
    if (!manager) throw new NotFoundException('Користувач не є менеджером');
    order.manager = manager;
  }
}
