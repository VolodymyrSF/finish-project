import { UserEntity } from '../database/entities/user.entity';
import { RoleEntity } from '../database/entities/role.entity';
import { RoleEnum } from '../database/entities/enums/role.enum';

export const mockUser: UserEntity = {
  id: '1',
  name: 'John',
  email: 'john@example.com',
  password: 'hashedPassword',
  role: {
    id: '10',
    name: RoleEnum.MANAGER,
    users: []
  } as RoleEntity,
  refreshTokens: [],
  created_at: new Date(),
  updated_at: new Date()
};