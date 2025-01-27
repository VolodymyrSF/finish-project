import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RedisModule } from './modules/redis/redis.module';
import { MysqlModule } from './modules/mysql/mysql.module';
import configuration from './config/configuration';
import { SeedModule } from './modules/seed/seed.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    RedisModule,
    MysqlModule,
    SeedModule,
    OrdersModule,
  ],
})
export class AppModule {}
