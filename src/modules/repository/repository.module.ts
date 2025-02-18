import { Global, Module } from '@nestjs/common';


import { RefreshTokenRepository } from './services/refresh-token.repository';

import { UserRepository } from './services/user.repository';
import { RoleRepository } from './services/role.repository';
import { OrdersRepository } from './services/orders.repository';
import { ManagerRepository } from './services/manager.repository';
import { GroupRepository } from './services/group.repository';

const repositories = [
  UserRepository,
  RefreshTokenRepository,
  RoleRepository,
  OrdersRepository,
  ManagerRepository,
  GroupRepository
];

@Global()
@Module({
  providers: [...repositories],
  exports: [...repositories],
})
export class RepositoryModule {}
