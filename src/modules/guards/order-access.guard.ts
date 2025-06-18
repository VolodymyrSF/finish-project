import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { RoleEnum } from '../../database/entities/enums/role.enum';
import { ManagerRepository } from '../repository/services/manager.repository';
import { OrdersRepository } from '../repository/services/orders.repository';

@Injectable()
export class OrderAccessGuard implements CanActivate {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly managerRepository: ManagerRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const currentUser = request.user;
    const orderId = request.params.id;

    if (!orderId) {
      throw new ForbiddenException('ID замовлення відсутнє');
    }
    if (!currentUser) {
      throw new ForbiddenException('Поточний користувач не знайдений');
    }

    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['manager'],
    });

    if (!order) {
      throw new ForbiddenException('Замовлення не знайдено');
    }

    const allowedRoles = [RoleEnum.MANAGER, RoleEnum.ADMIN];

    // Якщо у замовлення немає менеджера, і користувач - менеджер чи адмін — доступ є
    if (allowedRoles.includes(currentUser.role.name) && !order.manager) {
      return true;
    }

    // Перевірка, чи менеджер замовлення відповідає користувачу
    if (
      allowedRoles.includes(currentUser.role.name) &&
      order.manager?.userId === currentUser.id
    ) {
      return true;
    }

    throw new ForbiddenException('У вас немає доступу до цього замовлення');
  }
}
