import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { RoleEnum } from './enums/role.enum';
import { UserEntity } from './user.entity';

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: RoleEnum, unique: true }) // Використання enum
  name: RoleEnum;

  @OneToMany(() => UserEntity, (user) => user.role)
  users: UserEntity[];

}
