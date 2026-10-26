import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from './employee.entity';

@Entity('salary_records')
export class SalaryRecord {
  @PrimaryGeneratedColumn({ name: 'salary_id' })
  salaryId: number;

  @Column({ name: 'employee_id', type: 'int' })
  employeeId: number;

  @Column({ name: 'period', type: 'varchar', length: 20 })
  period: string; // e.g., '2026-10'

  @Column({
    name: 'base_salary',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  baseSalary: number;

  @Column({
    name: 'bonus',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  bonus: number;

  @Column({
    name: 'deduction',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  deduction: number;

  @Column({
    name: 'total_salary',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  totalSalary: number;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'PAID' })
  status: string;

  @Column({ name: 'note', type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;
}
