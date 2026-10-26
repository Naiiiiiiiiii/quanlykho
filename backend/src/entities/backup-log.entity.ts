import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('backup_logs')
export class BackupLog {
  @PrimaryGeneratedColumn({ name: 'backup_id' })
  backupId: number;

  @Column({ name: 'status', type: 'varchar', length: 50 })
  status: string; // 'SUCCESS' | 'FAILED'

  @Column({ name: 'file_path', type: 'text', nullable: true })
  filePath?: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize?: number;

  @Column({ name: 'performed_by', type: 'int', nullable: true })
  performedBy?: number;

  @Column({ name: 'note', type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
