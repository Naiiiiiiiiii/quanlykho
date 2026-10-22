import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserAccount } from './user-account.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn({ name: 'role_id' })
  roleId: number;

  @Column({ name: 'name', type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
  description?: string;

  // Quan hệ 1-N với UserAccount
  @OneToMany(() => UserAccount, (account) => account.role)
  userAccounts: UserAccount[];
}
