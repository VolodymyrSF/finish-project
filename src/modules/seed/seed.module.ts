// seed.module.ts
import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { RepositoryModule } from '../repository/repository.module';
import { AuthModule } from '../auth/auth.module';
import { RoleRepository } from '../repository/services/role.repository';
import { UserRepository } from '../repository/services/user.repository';
import { TokenService } from '../auth/services/token.service';
import { JwtModule } from '@nestjs/jwt'; // Імпортуємо ваш SeedService

@Module({
  imports: [AuthModule,RepositoryModule,JwtModule],
  providers: [SeedService, RoleRepository, UserRepository, TokenService]})

export class SeedModule {}
