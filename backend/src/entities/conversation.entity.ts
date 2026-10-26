import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ConversationParticipant } from './conversation-participant.entity';
import { Message } from './message.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn({ name: 'conversation_id' })
  conversationId: number;

  @Column({ name: 'title', type: 'varchar', length: 255, nullable: true })
  title?: string;

  @Column({ name: 'type', type: 'varchar', length: 50, default: 'GROUP' })
  type: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(
    () => ConversationParticipant,
    (participant) => participant.conversation,
  )
  participants: ConversationParticipant[];

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}
