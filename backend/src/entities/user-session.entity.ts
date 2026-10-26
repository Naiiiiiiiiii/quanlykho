import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserAccount } from './user-account.entity';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn({ name: 'session_id' })
  sessionId: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'token', type: 'text' })
  token: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt?: Date;

  @ManyToOne(() => UserAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserAccount;
}
