import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { UserAccount } from './user-account.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn({ name: 'message_id' })
  messageId: number;

  @Column({ name: 'conversation_id', type: 'int' })
  conversationId: number;

  @Column({ name: 'sender_id', type: 'int' })
  senderId: number;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => UserAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: UserAccount;
}
