import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { CreateUpdateModel } from './models/create-update.model';
import { ManagerEntity } from './manager.entity';

@Entity('refresh_tokens')
export class RefreshTokenEntity extends CreateUpdateModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  refreshToken: string;

  @Column({ nullable: true })
  user_id: string;

  @ManyToOne(() => UserEntity, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ nullable: true })
  manager_id: string;

  @ManyToOne(() => ManagerEntity, (manager) => manager.refreshTokens, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: ManagerEntity;
}
