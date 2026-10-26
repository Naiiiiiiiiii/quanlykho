import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';

@Controller('conversations')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * UC11 - Tải danh sách cuộc trò chuyện của người dùng hiện tại
   * UI -> System : taiDanhSachCuocTroChuyen(userId)
   */
  @Get()
  async findMyConversations(@CurrentUser() user: AuthenticatedUser) {
    return this.chatService.getConversationsByUser(user.sub);
  }

  /**
   * UC11 - Xem chi tiết tin nhắn trong cuộc trò chuyện
   * UI -> System : yeuCauXemTinNhan(conversationId, userId)
   */
  @Get(':id/messages')
  async getMessages(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.chatService.getMessages(id, user.sub);
  }

  /**
   * UC12 - Gửi tin nhắn trong cuộc trò chuyện
   * UI -> System : guiTinNhan(conversationId, userId, noiDung)
   */
  @Post(':id/messages')
  async sendMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.chatService.sendMessage(id, user.sub, dto);
  }
}
