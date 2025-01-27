import { Module } from '@nestjs/common';
import { RepositoryModule } from '../repository/repository.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [RepositoryModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
