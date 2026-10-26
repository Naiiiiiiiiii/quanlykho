import { Controller, Get, Query } from '@nestjs/common';
import { HrService } from './hr.service';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import {
  Roles,
  ForbiddenMessage,
} from '../../common/decorators/roles.decorator';

@Controller()
export class HrController {
  constructor(private readonly hrService: HrService) {}

  /**
   * UC21 - Xem lương thưởng
   * UI -> HT : yeuCauXemLuong(userId, userRole)
   */
  @Get('salaries')
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Bạn không có quyền xem thông tin lương thưởng')
  async getSalaries(
    @CurrentUser() user: AuthenticatedUser | null,
    @Query('period') period?: string,
  ) {
    return this.hrService.getSalaries({
      userRole: user?.role,
      employeeId: user?.employeeId,
      period,
    });
  }

  /**
   * UC22 - Xem thông tin công việc
   * UI -> System : yeuCauXemCongViec(staffId, loaiCongViec)
   */
  @Get('tasks')
  @Roles('ADMIN', 'USER')
  @ForbiddenMessage('Từ chối truy cập: Không đủ quyền')
  async getTasks(
    @CurrentUser() user: AuthenticatedUser | null,
    @Query('taskType') taskType?: string,
  ) {
    return this.hrService.getWorkTasks({
      userRole: user?.role,
      employeeId: user?.employeeId,
      taskType,
    });
  }
}
