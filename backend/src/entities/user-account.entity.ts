import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from './employee.entity';
import { Role } from './role.entity';

@Entity('user_accounts')
export class UserAccount {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ name: 'employee_id', type: 'int', unique: true })
  employeeId: number;

  @Column({ name: 'username', type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'role_id', type: 'int', nullable: true })
  roleId?: number;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'ACTIVE' })
  status: string;

  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Quan hệ 1-1 với Employee
  @OneToOne(() => Employee, (employee) => employee.userAccount, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  // Quan hệ N-1 với Role
  @ManyToOne(() => Role, (role) => role.userAccounts, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'role_id' })
  role?: Role;
}
