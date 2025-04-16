import { UnauthorizedException } from '@nestjs/common';
import { ManagerEntity } from '../database/entities/manager.entity';


export function assertManagerLoginAllowed(manager: ManagerEntity): void {
  if (!Boolean(manager.isActive)) {
    throw new UnauthorizedException('Менеджер не активований');
  }

  if (Boolean(manager.isBanned)) {
    throw new UnauthorizedException('Менеджер заблокований');
  }
}
