import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { Employee } from './employee.entity';
import { ExportDetail } from './export-detail.entity';
import { Delivery } from './delivery.entity';

@Entity('export_receipts')
export class ExportReceipt {
  @PrimaryGeneratedColumn({ name: 'export_id' })
  exportId: number;

  @Column({ name: 'warehouse_id', type: 'int' })
  warehouseId: number;

  @Column({ name: 'employee_id', type: 'int', nullable: true })
  employeeId?: number;

  @Column({
    name: 'export_date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  exportDate: Date;

  @Column({ name: 'reason', type: 'varchar', length: 255, nullable: true })
  reason?: string;

  @Column({ name: 'receiver', type: 'varchar', length: 255, nullable: true })
  receiver?: string;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'DRAFT' })
  status: string;

  @Column({ name: 'note', type: 'text', nullable: true })
  note?: string;

  // Quan hệ N-1 với Warehouse
  @ManyToOne(() => Warehouse, (warehouse) => warehouse.exportReceipts, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  // Quan hệ N-1 với Employee
  @ManyToOne(() => Employee, (employee) => employee.exportReceipts, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'employee_id' })
  employee?: Employee;

  // Quan hệ 1-N với ExportDetail
  @OneToMany(() => ExportDetail, (detail) => detail.exportReceipt)
  exportDetails: ExportDetail[];

  // Quan hệ 1-N với Delivery
  @OneToMany(() => Delivery, (delivery) => delivery.exportReceipt)
  deliveries: Delivery[];
}
