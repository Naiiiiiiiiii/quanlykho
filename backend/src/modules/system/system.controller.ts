import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { SystemService } from './system.service';
import { RunBackupDto } from './dto/run-backup.dto';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import {
  Roles,
  ForbiddenMessage,
} from '../../common/decorators/roles.decorator';

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  /**
   * UC19 - Mở chức năng sao lưu & kiểm tra quyền/cấu hình
   * UI -> HT : kiemTraQuyenVaCauHinh()
   */
  @Get('backup/config')
  @Roles('ADMIN')
  @ForbiddenMessage('Không đủ quyền hoặc thiếu cấu hình sao lưu')
  async checkBackupConfig(@CurrentUser() user: AuthenticatedUser | null) {
    return this.systemService.checkBackupConfig(user?.role);
  }

  /**
   * UC19 - Xác nhận bắt đầu sao lưu
   * UI -> HT : guiYeuCauChayBackup()
   */
  @Post('backup')
  @Roles('ADMIN')
  @ForbiddenMessage('Không đủ quyền hoặc thiếu cấu hình sao lưu')
  async runBackup(
    @CurrentUser() user: AuthenticatedUser | null,
    @Body() body?: RunBackupDto,
  ) {
    return this.systemService.runBackup({
      userRole: user?.role,
      userId: user?.sub,
      simulateDiskError: body?.simulateDiskError,
      simulateLogError: body?.simulateLogError,
    });
  }

  /**
   * UC23 - Xem danh sách lỗi hệ thống
   * UI -> System : yeuCauLayDanhSachLoi()
   */
  @Get('errors')
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Từ chối truy cập')
  async getErrorLogs() {
    return this.systemService.getErrorLogs();
  }

  /**
   * UC23 - Xem chi tiết lỗi hệ thống
   */
  @Get('errors/:id')
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Từ chối truy cập')
  async getErrorLogDetail(@Param('id', ParseIntPipe) id: number) {
    return this.systemService.getErrorLogDetail(id);
  }
}
