import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Rack } from './rack.entity';
import { InventoryLocation } from './inventory-location.entity';

@Entity('storage_locations')
export class StorageLocation {
  @PrimaryGeneratedColumn({ name: 'location_id' })
  locationId: number;

  @Column({ name: 'rack_id', type: 'int' })
  rackId: number;

  @Column({ name: 'level', type: 'int' })
  level: number;

  @Column({ name: 'code', type: 'varchar', length: 50 })
  code: string;

  @Column({ name: 'capacity', type: 'int' })
  capacity: number;

  @Column({ name: 'current_quantity', type: 'int', default: 0 })
  currentQuantity: number;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'AVAILABLE' })
  status: string;

  // Quan hệ N-1 với Rack
  @ManyToOne(() => Rack, (rack) => rack.storageLocations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'rack_id' })
  rack: Rack;

  // Quan hệ 1-N với InventoryLocation
  @OneToMany(() => InventoryLocation, (inv) => inv.location)
  inventoryLocations: InventoryLocation[];
}
