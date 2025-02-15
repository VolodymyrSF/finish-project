import { Module } from '@nestjs/common';
import { RepositoryModule } from '../repository/repository.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderAccessGuard } from '../guards/order-access.guard';
import { JwtAccessGuard } from '../guards/jwt-access.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [RepositoryModule,AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService,JwtAccessGuard,OrderAccessGuard],
})
export class OrdersModule {}
