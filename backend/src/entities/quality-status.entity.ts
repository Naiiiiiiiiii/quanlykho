import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { QualityCheck } from './quality-check.entity';

@Entity('quality_statuses')
export class QualityStatus {
  @PrimaryGeneratedColumn({ name: 'quality_status_id' })
  qualityStatusId: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
  description?: string;

  // Quan hệ 1-N với QualityCheck
  @OneToMany(() => QualityCheck, (check) => check.status)
  qualityChecks: QualityCheck[];
}
