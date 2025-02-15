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
      throw new ForbiddenException('Invalid request, user is not authenticated or you are not a manager');
    }
    if( !currentUser){
      throw new ForbiddenException('problem with current user');
    }


    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['manager']
    });

    if (!order) {
      throw new ForbiddenException('Order not found');
    }

    if (order.manager && order.manager.id !== currentUser.id) {
      throw new ForbiddenException('You do not have access to this order');
    }


    request.order = order;

    return true;
  }
}
