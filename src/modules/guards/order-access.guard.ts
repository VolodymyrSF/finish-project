import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { OrdersRepository } from '../repository/services/orders.repository';

@Injectable()
export class OrderAccessGuard implements CanActivate {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const currentUser = request.user;
    const orderId = request.params.id;

    if (!orderId) {
      throw new ForbiddenException('Користувач не автентифікований');
    }
    if( !currentUser){
      throw new ForbiddenException('Поточний користувач не знайдений');
    }


    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['manager']
    });

    if (!order) {
      throw new ForbiddenException('Заявки не знайдено');
    }

    if (order.manager && order.manager.id !== currentUser.id) {
      throw new ForbiddenException('У вас немає доступу до цієї заявки');
    }


    request.order = order;

    return true;
  }
}
