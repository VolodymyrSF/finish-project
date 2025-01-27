import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

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

  @Column()
  status: string;

  @Column('decimal')
  sum: number;

  @Column('decimal')
  alreadyPaid: number;

  @CreateDateColumn()
  created_at: Date;
}
