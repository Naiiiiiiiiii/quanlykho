import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { Lot } from './lot.entity';
import { StorageLocation } from './storage-location.entity';

@Entity('inventory_locations')
export class InventoryLocation {
  @PrimaryGeneratedColumn({ name: 'inventory_location_id' })
  inventoryLocationId: number;

  @Column({ name: 'variant_id', type: 'int' })
  variantId: number;

  @Column({ name: 'lot_id', type: 'int' })
  lotId: number;

  @Column({ name: 'location_id', type: 'int' })
  locationId: number;

  @Column({ name: 'quantity', type: 'int', default: 0 })
  quantity: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Quan hệ N-1 với ProductVariant
  @ManyToOne(() => ProductVariant, (variant) => variant.inventoryLocations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  // Quan hệ N-1 với Lot
  @ManyToOne(() => Lot, (lot) => lot.inventoryLocations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lot_id' })
  lot: Lot;

  // Quan hệ N-1 với StorageLocation
  @ManyToOne(() => StorageLocation, (location) => location.inventoryLocations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'location_id' })
  location: StorageLocation;
}
