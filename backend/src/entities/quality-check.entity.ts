import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lot } from './lot.entity';
import { Employee } from './employee.entity';
import { QualityStatus } from './quality-status.entity';

@Entity('quality_checks')
export class QualityCheck {
  @PrimaryGeneratedColumn({ name: 'quality_check_id' })
  qualityCheckId: number;

  @Column({ name: 'lot_id', type: 'int' })
  lotId: number;

  @Column({ name: 'employee_id', type: 'int', nullable: true })
  employeeId?: number;

  @Column({
    name: 'check_date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  checkDate: Date;

  @Column({ name: 'status_id', type: 'int' })
  statusId: number;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  // Quan hệ N-1 với Lot
  @ManyToOne(() => Lot, (lot) => lot.qualityChecks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lot_id' })
  lot: Lot;

  // Quan hệ N-1 với Employee
  @ManyToOne(() => Employee, (employee) => employee.qualityChecks, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'employee_id' })
  employee?: Employee;

  // Quan hệ N-1 với QualityStatus
  @ManyToOne(() => QualityStatus, (status) => status.qualityChecks, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'status_id' })
  status: QualityStatus;
}
