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

@Entity('conversation_participants')
export class ConversationParticipant {
  @PrimaryGeneratedColumn({ name: 'participant_id' })
  participantId: number;

  @Column({ name: 'conversation_id', type: 'int' })
  conversationId: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;

  @ManyToOne(() => Conversation, (conversation) => conversation.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => UserAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserAccount;
}
