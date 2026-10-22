import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { Rack } from './rack.entity';

@Entity('warehouse_zones')
export class WarehouseZone {
  @PrimaryGeneratedColumn({ name: 'zone_id' })
  zoneId: number;

  @Column({ name: 'warehouse_id', type: 'int' })
  warehouseId: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  // Quan hệ N-1 với Warehouse
  @ManyToOne(() => Warehouse, (warehouse) => warehouse.zones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  // Quan hệ 1-N với Rack
  @OneToMany(() => Rack, (rack) => rack.zone)
  racks: Rack[];
}
