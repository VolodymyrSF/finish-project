
import { UserEntity } from '../../database/entities/user.entity';
import { UserResDto } from './models/dto/res/user.res.dto';
import { IJwtPayload } from '../auth/models/interfaces/jwt-payload.interface';

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

  public static toIUserData(user: UserEntity, jwtPayload: IJwtPayload): any {
    return {
      userId: user.id,
      email: user.email,
      roleId: user.role,
    };
  }
}
