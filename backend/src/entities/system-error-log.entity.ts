import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('system_error_logs')
export class SystemErrorLog {
  @PrimaryGeneratedColumn({ name: 'error_id' })
  errorId: number;

  @Column({ name: 'error_code', type: 'varchar', length: 100 })
  errorCode: string;

  @Column({ name: 'module_name', type: 'varchar', length: 100, nullable: true })
  moduleName?: string;

  @Column({ name: 'path', type: 'varchar', length: 255, nullable: true })
  path?: string;

  @Column({ name: 'method', type: 'varchar', length: 20, nullable: true })
  method?: string;

  @Column({ name: 'message', type: 'text' })
  message: string;

  @Column({ name: 'detail', type: 'text', nullable: true })
  detail?: string;

  @Column({ name: 'severity', type: 'varchar', length: 50, default: 'ERROR' })
  severity: string;

  @Column({ name: 'request_id', type: 'varchar', length: 100, nullable: true })
  requestId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
