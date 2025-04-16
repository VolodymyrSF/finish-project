import { UserEntity } from '../database/entities/user.entity';
import { UserResDto } from '../modules/user/models/dto/res/user.res.dto';
import { ManagerEntity } from '../database/entities/manager.entity';
import { ManagerAuthResDto } from '../modules/auth/models/dto/res/manager.auth.res.dto';


export class UserMapper {
  static toResDto(user: UserEntity): UserResDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role?.name,
      created_at: user.created_at ?? null,
      updated_at: user.updated_at ?? null,
    };
  }

  static toManagerAuthResDto(manager: ManagerEntity): ManagerAuthResDto {
    return {
      id: manager.id,
      name: manager.name,
      surname: manager.surname,
      email: manager.email,
      phone: manager.phone ?? null,
      isActive: manager.isActive,
      isBanned: manager.isBanned,
      created_at: manager.created_at ?? null,
      updated_at: manager.updated_at ?? null,
    };
  }
}
