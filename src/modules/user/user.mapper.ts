
import { UserEntity } from '../../database/entities/user.entity';
import { UserResDto } from './models/dto/res/user.res.dto';
import { IJwtPayload } from '../auth/models/interfaces/jwt-payload.interface';
import { ManagerEntity } from '../../database/entities/manager.entity';
import { RoleEnum } from '../../database/entities/enums/role.enum';
import { ManagerAuthResDto } from '../auth/models/dto/res/manager.auth.res.dto';

export class UserMapper {
  public static toResDto(user: UserEntity): UserResDto {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role.name,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  public static toManagerAuthResDto(manager: ManagerEntity): ManagerAuthResDto {
    return {
      id: manager.id.toString(),
      name: manager.name,
      surname: manager.surname || null,
      email: manager.email,
      phone: manager.phone || null,
      isActive: manager.isActive,
      isBanned: manager.isBanned,
      created_at: manager.created_at,
      updated_at: manager.updated_at,
    };
  }

  public static toIUserData(user: UserEntity, jwtPayload: IJwtPayload): any {
    return {
      userId: user.id,
      email: user.email,
      roleId: user.role,
    };
  }
}
