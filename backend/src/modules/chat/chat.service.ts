import {
  Injectable,
  OnModuleInit,
  Logger,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../../entities/conversation.entity';
import { ConversationParticipant } from '../../entities/conversation-participant.entity';
import { Message } from '../../entities/message.entity';
import { UserAccount } from '../../entities/user-account.entity';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService implements OnModuleInit {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private readonly participantRepo: Repository<ConversationParticipant>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(UserAccount)
    private readonly userAccountRepo: Repository<UserAccount>,
  ) {}

  async onModuleInit() {
    await this.seedChatData();
  }

  /**
   * UC11 - Xem cuộc trò chuyện (Lấy danh sách theo userId)
   * Sequence diagram:
   * - System -> Conv : layDanhSachTheoUser(userId)
   * - Nhánh 1: Lỗi truy vấn -> "Lỗi truy vấn dữ liệu"
   * - Nhánh 2: Danh sách trống -> "Chưa có cuộc trò chuyện nào"
   * - Nhánh 3: Tải danh sách thành công -> traVeDanhSachCuocTroChuyen(danhSach)
   */
  async getConversationsByUser(userId: number) {
    try {
      const memberships = await this.participantRepo.find({
        where: { userId },
        relations: {
          conversation: {
            participants: {
              user: {
                employee: true,
              },
            },
            messages: true,
          },
        },
      });

      const conversations = memberships
        .map((m) => m.conversation)
        .filter(Boolean);

      if (conversations.length === 0) {
        return {
          message: 'Chưa có cuộc trò chuyện nào',
          data: [],
        };
      }

      return {
        message: 'Lấy danh sách cuộc trò chuyện thành công',
        data: conversations,
      };
    } catch (error) {
      this.logger.error('Lỗi truy vấn danh sách cuộc trò chuyện: ', error);
      throw new InternalServerErrorException('Lỗi truy vấn dữ liệu');
    }
  }

  /**
   * UC11 - Xem chi tiết tin nhắn của một cuộc trò chuyện
   * Sequence diagram:
   * - System -> Conv : kiemTraQuyenTruyCap(conversationId, userId)
   * - Nếu không có quyền -> "Từ chối hiển thị: Không có quyền truy cập"
   * - Nếu hợp lệ -> System -> Msg : layDanhSachTinNhan(conversationId)
   */
  async getMessages(conversationId: number, userId: number) {
    const member = await this.participantRepo.findOne({
      where: { conversationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Từ chối hiển thị: Không có quyền truy cập');
    }

    try {
      const messages = await this.messageRepo.find({
        where: { conversationId },
        relations: {
          sender: {
            employee: true,
          },
        },
        order: {
          createdAt: 'ASC',
        },
      });

      return {
        message: 'Lấy nội dung cuộc trò chuyện thành công',
        data: messages,
      };
    } catch (error) {
      this.logger.error('Lỗi truy vấn tin nhắn: ', error);
      throw new InternalServerErrorException('Lỗi truy vấn dữ liệu');
    }
  }

  /**
   * UC12 - Gửi/nhận tin nhắn
   * Sequence diagram:
   * - Nhánh 1: Nội dung rỗng hoặc không hợp lệ -> "Nội dung không hợp lệ, yêu cầu chỉnh sửa"
   * - Nhánh 2: Không tham gia cuộc trò chuyện -> kiemTraThanhVien(conversationId, userId) -> "Từ chối: Bạn không tham gia cuộc trò chuyện này"
   * - Nhánh 3: Lỗi lưu hoặc chuyển tin nhắn -> "Gửi tin nhắn thất bại"
   * - Nhánh 4: Gửi tin nhắn thành công -> luuTinNhan -> chuyenTinNhan -> xacNhanGuiThanhCong(tinNhanMoi)
   */
  async sendMessage(
    conversationId: number,
    userId: number,
    dto: SendMessageDto,
  ) {
    if (!dto || !dto.content || dto.content.trim() === '') {
      throw new BadRequestException('Nội dung không hợp lệ, yêu cầu chỉnh sửa');
    }

    const member = await this.participantRepo.findOne({
      where: { conversationId, userId },
    });

    if (!member) {
      throw new ForbiddenException(
        'Từ chối: Bạn không tham gia cuộc trò chuyện này',
      );
    }

    try {
      const msg = this.messageRepo.create({
        conversationId,
        senderId: userId,
        content: dto.content.trim(),
      });
      const saved = await this.messageRepo.save(msg);

      const fullMsg = await this.messageRepo.findOne({
        where: { messageId: saved.messageId },
        relations: {
          sender: {
            employee: true,
          },
        },
      });

      return {
        message: 'Gửi tin nhắn thành công',
        data: fullMsg || saved,
      };
    } catch (error) {
      this.logger.error('Lỗi khi lưu hoặc chuyển tin nhắn: ', error);
      throw new InternalServerErrorException('Gửi tin nhắn thất bại');
    }
  }

  async seedChatData(): Promise<void> {
    try {
      const count = await this.conversationRepo.count();
      if (count > 0) return;

      const adminUser = await this.userAccountRepo.findOne({
        where: { username: 'admin' },
      });
      const staffUser = await this.userAccountRepo.findOne({
        where: { username: 'thukho' },
      });

      if (!adminUser || !staffUser) return;

      const conv = await this.conversationRepo.save({
        title: 'Kênh Điều Phối Vận Hành Kho Trung Tâm',
        type: 'GROUP',
      });

      await this.participantRepo.save([
        { conversationId: conv.conversationId, userId: adminUser.userId },
        { conversationId: conv.conversationId, userId: staffUser.userId },
      ]);

      await this.messageRepo.save([
        {
          conversationId: conv.conversationId,
          senderId: adminUser.userId,
          content:
            'Chào Thủ kho, hôm nay lô hàng Áo Polo LOT-2026-001 đã kiểm định xong chưa?',
        },
        {
          conversationId: conv.conversationId,
          senderId: staffUser.userId,
          content:
            'Báo cáo Admin, lô LOT-2026-001 đã đạt chuẩn 100% và xếp lên kệ LOC-A1-L1 rồi ạ.',
        },
      ]);

      this.logger.log(
        'Đã khởi tạo dữ liệu mẫu Cuộc trò chuyện & Tin nhắn (UC11, UC12)',
      );
    } catch (err) {
      this.logger.warn('Seed chat data check: ' + (err as Error).message);
    }
  }
}
