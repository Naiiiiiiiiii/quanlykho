import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from './employee.entity';
import { Warehouse } from './warehouse.entity';

@Entity('work_tasks')
export class WorkTask {
  @PrimaryGeneratedColumn({ name: 'task_id' })
  taskId: number;

  @Column({ name: 'employee_id', type: 'int' })
  employeeId: number;

  @Column({ name: 'warehouse_id', type: 'int', nullable: true })
  warehouseId?: number;

  @Column({ name: 'task_type', type: 'varchar', length: 100 })
  taskType: string; // 'NHAP_KHO' | 'XUAT_KHO' | 'KIEM_KE' | 'KIEM_DINH' | 'GIAO_HANG'

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'PENDING' })
  status: string;

  @Column({ name: 'due_date', type: 'timestamp', nullable: true })
  dueDate?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => Warehouse, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse?: Warehouse;
}
