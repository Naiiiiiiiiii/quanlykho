import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ExportReceipt } from './export-receipt.entity';
import { ProductVariant } from './product-variant.entity';
import { Lot } from './lot.entity';

@Entity('export_details')
export class ExportDetail {
  @PrimaryGeneratedColumn({ name: 'export_detail_id' })
  exportDetailId: number;

  @Column({ name: 'export_id', type: 'int' })
  exportId: number;

  @Column({ name: 'variant_id', type: 'int' })
  variantId: number;

  @Column({ name: 'lot_id', type: 'int', nullable: true })
  lotId?: number;

  @Column({ name: 'location_id', type: 'int', nullable: true })
  locationId?: number;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  unitPrice?: number;

  @Column({
    name: 'discount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    nullable: true,
  })
  discount?: number;

  // Quan hệ N-1 với ExportReceipt
  @ManyToOne(() => ExportReceipt, (receipt) => receipt.exportDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'export_id' })
  exportReceipt: ExportReceipt;

  // Quan hệ N-1 với ProductVariant
  @ManyToOne(() => ProductVariant, (variant) => variant.exportDetails, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  // Quan hệ N-1 với Lot
  @ManyToOne(() => Lot, (lot) => lot.exportDetails, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'lot_id' })
  lot?: Lot;
}
