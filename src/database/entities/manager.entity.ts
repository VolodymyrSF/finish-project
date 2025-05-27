import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { OrderEntity } from './orders.entity';
import { RefreshTokenEntity } from './refresh-token.entity';
import { UserEntity } from './user.entity';

@Entity('managers')
export class ManagerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  surname: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  password: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isBanned: boolean;

  @OneToMany(() => OrderEntity, (order) => order.manager)
  orders: OrderEntity[];

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => UserEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => RefreshTokenEntity, (entity) => entity.manager)
  refreshTokens?: RefreshTokenEntity[];
}
