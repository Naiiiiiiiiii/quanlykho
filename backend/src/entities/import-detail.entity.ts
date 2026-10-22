import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ImportReceipt } from './import-receipt.entity';
import { ProductVariant } from './product-variant.entity';
import { Lot } from './lot.entity';

@Entity('import_details')
export class ImportDetail {
  @PrimaryGeneratedColumn({ name: 'import_detail_id' })
  importDetailId: number;

  @Column({ name: 'import_id', type: 'int' })
  importId: number;

  @Column({ name: 'variant_id', type: 'int' })
  variantId: number;

  @Column({ name: 'lot_id', type: 'int', nullable: true })
  lotId?: number;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({ name: 'unit', type: 'varchar', length: 50, nullable: true })
  unit?: string;

  // Quan hệ N-1 với ImportReceipt
  @ManyToOne(() => ImportReceipt, (receipt) => receipt.importDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'import_id' })
  importReceipt: ImportReceipt;

  // Quan hệ N-1 với ProductVariant
  @ManyToOne(() => ProductVariant, (variant) => variant.importDetails, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  // Quan hệ N-1 với Lot
  @ManyToOne(() => Lot, (lot) => lot.importDetails, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'lot_id' })
  lot?: Lot;
}
