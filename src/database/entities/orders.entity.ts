import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ManagerEntity } from './manager.entity';
import { GroupEntity } from './group.entity';
import { Status } from './enums/order-status.enum';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  surname: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  age: number;

  @Column()
  course: string;

  @Column()
  course_format: string;

  @Column()
  course_type: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.New,
  })
  status: Status;

  @Column('decimal')
  sum: number;

  @Column('decimal')
  alreadyPaid: number;

  @CreateDateColumn({nullable: true})
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @Column({ nullable: true })
  msg: string;

  @Column({ nullable: true })
  utm: string;

  @Column('json', { nullable: true })
  comments: { text: string; author: string; createdAt: Date }[];

  @ManyToOne(() => ManagerEntity, (manager) => manager.orders, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: ManagerEntity;

  @ManyToOne(() => GroupEntity, (group) => group.orders, { nullable: true })
  @JoinColumn({ name: 'group_id' })
  group: GroupEntity;


}
