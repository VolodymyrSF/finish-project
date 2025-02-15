import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { OrderEntity } from './orders.entity';

@Entity('managers')
export class ManagerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @OneToMany(() => OrderEntity, (order) => order.manager)
  orders: OrderEntity[];
}
