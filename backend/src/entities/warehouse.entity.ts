import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { WarehouseZone } from './warehouse-zone.entity';
import { ImportReceipt } from './import-receipt.entity';
import { ExportReceipt } from './export-receipt.entity';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn({ name: 'warehouse_id' })
  warehouseId: number;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'address', type: 'text', nullable: true })
  address?: string;

  @Column({
    name: 'area',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  area?: number;

  @Column({ name: 'capacity', type: 'int', nullable: true })
  capacity?: number;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'ACTIVE' })
  status: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Quan hệ 1-N với WarehouseZone
  @OneToMany(() => WarehouseZone, (zone) => zone.warehouse)
  zones: WarehouseZone[];

  // Quan hệ 1-N với ImportReceipt
  @OneToMany(() => ImportReceipt, (receipt) => receipt.warehouse)
  importReceipts: ImportReceipt[];

  // Quan hệ 1-N với ExportReceipt
  @OneToMany(() => ExportReceipt, (receipt) => receipt.warehouse)
  exportReceipts: ExportReceipt[];
}
