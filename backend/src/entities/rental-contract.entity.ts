import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Warehouse } from './warehouse.entity';

@Entity('rental_contracts')
export class RentalContract {
  @PrimaryGeneratedColumn({ name: 'contract_id' })
  contractId: number;

  @Column({ name: 'warehouse_id', type: 'int' })
  warehouseId: number;

  @Column({ name: 'lessor_name', type: 'varchar', length: 255 })
  lessorName: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({
    name: 'rental_price',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  rentalPrice: number;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 50,
    default: 'DangHieuLuc',
  })
  status: string;

  @Column({ name: 'warning_email_sent', type: 'boolean', default: false })
  warningEmailSent: boolean;

  @Column({ name: 'email_error_log', type: 'text', nullable: true })
  emailErrorLog?: string;

  @Column({ name: 'note', type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Warehouse, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;
}
