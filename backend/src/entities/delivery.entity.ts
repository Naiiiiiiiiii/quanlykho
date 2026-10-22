import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ExportReceipt } from './export-receipt.entity';
import { Employee } from './employee.entity';
import { DeliveryDetail } from './delivery-detail.entity';

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn({ name: 'delivery_id' })
  deliveryId: number;

  @Column({ name: 'export_id', type: 'int', nullable: true })
  exportId?: number;

  @Column({ name: 'employee_id', type: 'int', nullable: true })
  employeeId?: number;

  @Column({ name: 'receiver_name', type: 'varchar', length: 255 })
  receiverName: string;

  @Column({
    name: 'receiver_phone',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  receiverPhone?: string;

  @Column({ name: 'delivery_address', type: 'text' })
  deliveryAddress: string;

  @Column({ name: 'delivery_date', type: 'timestamp', nullable: true })
  deliveryDate?: Date;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'PENDING' })
  status: string;

  @Column({ name: 'note', type: 'text', nullable: true })
  note?: string;

  // Quan hệ N-1 với ExportReceipt
  @ManyToOne(() => ExportReceipt, (receipt) => receipt.deliveries, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'export_id' })
  exportReceipt?: ExportReceipt;

  // Quan hệ N-1 với Employee
  @ManyToOne(() => Employee, (employee) => employee.deliveries, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'employee_id' })
  employee?: Employee;

  // Quan hệ 1-N với DeliveryDetail
  @OneToMany(() => DeliveryDetail, (detail) => detail.delivery)
  deliveryDetails: DeliveryDetail[];
}
