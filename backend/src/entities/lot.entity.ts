import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { ImportDetail } from './import-detail.entity';
import { ExportDetail } from './export-detail.entity';
import { InventoryLocation } from './inventory-location.entity';
import { QualityCheck } from './quality-check.entity';

@Entity('lots')
export class Lot {
  @PrimaryGeneratedColumn({ name: 'lot_id' })
  lotId: number;

  @Column({ name: 'variant_id', type: 'int' })
  variantId: number;

  @Column({ name: 'lot_code', type: 'varchar', length: 100, unique: true })
  lotCode: string;

  @Column({ name: 'manufacture_date', type: 'date', nullable: true })
  manufactureDate?: Date;

  @Column({ name: 'received_date', type: 'date' })
  receivedDate: Date;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ name: 'initial_quantity', type: 'int' })
  initialQuantity: number;

  @Column({ name: 'remaining_quantity', type: 'int' })
  remainingQuantity: number;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'AVAILABLE' })
  status: string;

  // Quan hệ N-1 với ProductVariant
  @ManyToOne(() => ProductVariant, (variant) => variant.lots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  // Quan hệ 1-N với ImportDetail
  @OneToMany(() => ImportDetail, (detail) => detail.lot)
  importDetails: ImportDetail[];

  // Quan hệ 1-N với ExportDetail
  @OneToMany(() => ExportDetail, (detail) => detail.lot)
  exportDetails: ExportDetail[];

  // Quan hệ 1-N với InventoryLocation
  @OneToMany(() => InventoryLocation, (inv) => inv.lot)
  inventoryLocations: InventoryLocation[];

  // Quan hệ 1-N với QualityCheck
  @OneToMany(() => QualityCheck, (check) => check.lot)
  qualityChecks: QualityCheck[];
}
