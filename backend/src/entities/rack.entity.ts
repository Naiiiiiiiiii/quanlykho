import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { WarehouseZone } from './warehouse-zone.entity';
import { StorageLocation } from './storage-location.entity';

@Entity('racks')
export class Rack {
  @PrimaryGeneratedColumn({ name: 'rack_id' })
  rackId: number;

  @Column({ name: 'zone_id', type: 'int' })
  zoneId: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'number_of_levels', type: 'int', default: 1 })
  numberOfLevels: number;

  @Column({ name: 'capacity', type: 'int', nullable: true })
  capacity?: number;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'AVAILABLE' })
  status: string;

  // Quan hệ N-1 với WarehouseZone
  @ManyToOne(() => WarehouseZone, (zone) => zone.racks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'zone_id' })
  zone: WarehouseZone;

  // Quan hệ 1-N với StorageLocation
  @OneToMany(() => StorageLocation, (location) => location.rack)
  storageLocations: StorageLocation[];
}
