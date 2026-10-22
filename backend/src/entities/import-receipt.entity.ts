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
import { ImportDetail } from './import-detail.entity';

@Entity('import_receipts')
export class ImportReceipt {
  @PrimaryGeneratedColumn({ name: 'import_id' })
  importId: number;

  @Column({ name: 'warehouse_id', type: 'int' })
  warehouseId: number;

  @Column({ name: 'employee_id', type: 'int', nullable: true })
  employeeId?: number;

  @Column({
    name: 'import_date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  importDate: Date;

  @Column({
    name: 'supplier_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  supplierName?: string;

  @Column({ name: 'total_quantity', type: 'int', default: 0 })
  totalQuantity: number;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'DRAFT' })
  status: string;

  @Column({ name: 'note', type: 'text', nullable: true })
  note?: string;

  // Quan hệ N-1 với Warehouse
  @ManyToOne(() => Warehouse, (warehouse) => warehouse.importReceipts, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  // Quan hệ N-1 với Employee
  @ManyToOne(() => Employee, (employee) => employee.importReceipts, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'employee_id' })
  employee?: Employee;

  // Quan hệ 1-N với ImportDetail
  @OneToMany(() => ImportDetail, (detail) => detail.importReceipt)
  importDetails: ImportDetail[];
}
