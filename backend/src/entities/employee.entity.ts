import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { UserAccount } from './user-account.entity';
import { ImportReceipt } from './import-receipt.entity';
import { ExportReceipt } from './export-receipt.entity';
import { QualityCheck } from './quality-check.entity';
import { Delivery } from './delivery.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn({ name: 'employee_id' })
  employeeId: number;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName: string;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ name: 'address', type: 'text', nullable: true })
  address?: string;

  @Column({ name: 'position', type: 'varchar', length: 100, nullable: true })
  position?: string;

  @Column({ name: 'hire_date', type: 'date', nullable: true })
  hireDate?: Date;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'ACTIVE' })
  status: string;

  // Quan hệ 1-1 với UserAccount
  @OneToOne(() => UserAccount, (account) => account.employee)
  userAccount: UserAccount;

  // Quan hệ 1-N với ImportReceipt
  @OneToMany(() => ImportReceipt, (receipt) => receipt.employee)
  importReceipts: ImportReceipt[];

  // Quan hệ 1-N với ExportReceipt
  @OneToMany(() => ExportReceipt, (receipt) => receipt.employee)
  exportReceipts: ExportReceipt[];

  // Quan hệ 1-N với QualityCheck
  @OneToMany(() => QualityCheck, (check) => check.employee)
  qualityChecks: QualityCheck[];

  // Quan hệ 1-N với Delivery
  @OneToMany(() => Delivery, (delivery) => delivery.employee)
  deliveries: Delivery[];
}
