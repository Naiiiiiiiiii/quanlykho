import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Size } from './size.entity';
import { Color } from './color.entity';
import { VariantStorageSpecification } from './variant-storage-specification.entity';
import { Lot } from './lot.entity';
import { ImportDetail } from './import-detail.entity';
import { ExportDetail } from './export-detail.entity';
import { InventoryLocation } from './inventory-location.entity';
import { DeliveryDetail } from './delivery-detail.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn({ name: 'variant_id' })
  variantId: number;

  @Column({ name: 'product_id', type: 'int' })
  productId: number;

  @Column({ name: 'size_id', type: 'int', nullable: true })
  sizeId?: number;

  @Column({ name: 'color_id', type: 'int', nullable: true })
  colorId?: number;

  @Column({ name: 'sku', type: 'varchar', length: 100, unique: true })
  sku: string;

  @Column({ name: 'barcode', type: 'varchar', length: 100, nullable: true })
  barcode?: string;

  @Column({
    name: 'weight',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  weight?: number;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'ACTIVE' })
  status: string;

  // Quan hệ N-1 với Product
  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  // Quan hệ N-1 với Size
  @ManyToOne(() => Size, (size) => size.variants, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'size_id' })
  size?: Size;

  // Quan hệ N-1 với Color
  @ManyToOne(() => Color, (color) => color.variants, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'color_id' })
  color?: Color;

  // Quan hệ 1-N với VariantStorageSpecification
  @OneToMany(() => VariantStorageSpecification, (vss) => vss.variant)
  variantStorageSpecifications: VariantStorageSpecification[];

  // Quan hệ 1-N với Lot
  @OneToMany(() => Lot, (lot) => lot.variant)
  lots: Lot[];

  // Quan hệ 1-N với ImportDetail
  @OneToMany(() => ImportDetail, (detail) => detail.variant)
  importDetails: ImportDetail[];

  // Quan hệ 1-N với ExportDetail
  @OneToMany(() => ExportDetail, (detail) => detail.variant)
  exportDetails: ExportDetail[];

  // Quan hệ 1-N với InventoryLocation
  @OneToMany(() => InventoryLocation, (inv) => inv.variant)
  inventoryLocations: InventoryLocation[];

  // Quan hệ 1-N với DeliveryDetail
  @OneToMany(() => DeliveryDetail, (detail) => detail.variant)
  deliveryDetails: DeliveryDetail[];
}
