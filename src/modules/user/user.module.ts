import { Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { RepositoryModule } from '../repository/repository.module';

@Module({
  imports: [AuthModule,RepositoryModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UserModule {}