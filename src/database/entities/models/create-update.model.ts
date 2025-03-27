import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class CreateUpdateModel {
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
