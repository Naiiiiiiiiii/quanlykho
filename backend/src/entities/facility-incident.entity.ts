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
import { Employee } from './employee.entity';

@Entity('facility_incidents')
export class FacilityIncident {
  @PrimaryGeneratedColumn({ name: 'incident_id' })
  incidentId: number;

  @Column({ name: 'warehouse_id', type: 'int', nullable: true })
  warehouseId?: number;

  @Column({ name: 'location_description', type: 'varchar', length: 255 })
  locationDescription: string;

  @Column({
    name: 'facility_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  facilityName?: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl?: string;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'Mới' })
  status: string;

  @Column({ name: 'repair_note', type: 'text', nullable: true })
  repairNote?: string;

  @Column({ name: 'reported_by', type: 'int', nullable: true })
  reportedBy?: number;

  @Column({ name: 'confirmed_by', type: 'int', nullable: true })
  confirmedBy?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Warehouse, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse?: Warehouse;

  @ManyToOne(() => Employee, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'reported_by' })
  reporter?: Employee;
}
