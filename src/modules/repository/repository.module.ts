import { Global, Module } from '@nestjs/common';


import { RefreshTokenRepository } from './services/refresh-token.repository';

import { UserRepository } from './services/user.repository';
import { RoleRepository } from './services/role.repository';
import { OrdersRepository } from './services/orders.repository';

const repositories = [
  UserRepository,
  RefreshTokenRepository,
  RoleRepository,
  OrdersRepository
];

@Global()
@Module({
  providers: [...repositories],
  exports: [...repositories],
})
export class RepositoryModule {}
