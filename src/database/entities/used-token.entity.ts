import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('used_tokens')
export class UsedTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  @Index({ unique: true })
  token: string;


  @Column()
  type: string;

  @CreateDateColumn()
  usedAt: Date;
}
